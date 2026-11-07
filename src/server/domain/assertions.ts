export interface BodyValidationRule {
  type: "contains" | "equals" | "json_path";
  target?: string;
  expectedValue?: string;
}

export interface AssertionValidationResult {
  passed: boolean;
  errors: string[];
}

/**
 * Validates actual HTTP status against expected list of status codes.
 */
export function validateStatusCode(
  actualStatus: number,
  expectedStatuses: number[]
): { passed: boolean; error?: string } {
  if (!expectedStatuses || expectedStatuses.length === 0) {
    return { passed: actualStatus >= 200 && actualStatus < 300 };
  }

  const passed = expectedStatuses.includes(actualStatus);
  return {
    passed,
    error: passed
      ? undefined
      : `Expected status code in [${expectedStatuses.join(", ")}], but received ${actualStatus}`,
  };
}

/**
 * Validates expected headers case-insensitively.
 */
export function validateHeaders(
  actualHeaders: Record<string, string>,
  expectedHeaders: Record<string, string>
): { passed: boolean; errors: string[] } {
  const errors: string[] = [];

  // Normalize actual headers to lowercase keys
  const normalizedActual: Record<string, string> = {};
  for (const [key, value] of Object.entries(actualHeaders)) {
    normalizedActual[key.toLowerCase()] = String(value);
  }

  for (const [expectedKey, expectedVal] of Object.entries(expectedHeaders)) {
    const actualVal = normalizedActual[expectedKey.toLowerCase()];
    if (actualVal === undefined) {
      errors.push(`Header "${expectedKey}" was missing in response`);
    } else if (actualVal.toLowerCase() !== String(expectedVal).toLowerCase()) {
      errors.push(
        `Header "${expectedKey}" expected "${expectedVal}", but got "${actualVal}"`
      );
    }
  }

  return {
    passed: errors.length === 0,
    errors,
  };
}

/**
 * Safely evaluates JSON path like "data.user.name" or "items[0].id" on parsed JSON.
 */
function getValueByJsonPath(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) {
    return undefined;
  }

  // Split path by dots and brackets: e.g. "data.users[0].name" -> ["data", "users", "0", "name"]
  const parts = path
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);

  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Validates response body based on validation rule.
 */
export function validateBody(
  actualBody: string,
  rule?: BodyValidationRule | null
): { passed: boolean; error?: string } {
  if (!rule || !rule.type) {
    return { passed: true };
  }

  switch (rule.type) {
    case "contains": {
      const target = rule.expectedValue || rule.target || "";
      const passed = actualBody.includes(target);
      return {
        passed,
        error: passed
          ? undefined
          : `Body assertion failed: Response does not contain "${target}"`,
      };
    }

    case "equals": {
      const expected = rule.expectedValue || "";
      const passed = actualBody.trim() === expected.trim();
      return {
        passed,
        error: passed
          ? undefined
          : `Body assertion failed: Response does not strictly equal expected value`,
      };
    }

    case "json_path": {
      const path = rule.target || "";
      const expected = rule.expectedValue;

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(actualBody);
      } catch {
        return {
          passed: false,
          error: `Body assertion failed: Response body is not valid JSON, cannot evaluate path "${path}"`,
        };
      }

      const actualValue = getValueByJsonPath(parsedJson, path);
      if (actualValue === undefined) {
        return {
          passed: false,
          error: `Body assertion failed: JSON path "${path}" does not exist in response`,
        };
      }

      if (expected !== undefined && String(actualValue) !== String(expected)) {
        return {
          passed: false,
          error: `Body assertion failed at path "${path}": expected "${expected}", got "${String(actualValue)}"`,
        };
      }

      return { passed: true };
    }

    default:
      return { passed: true };
  }
}
