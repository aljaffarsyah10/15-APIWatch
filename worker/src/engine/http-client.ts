import { validateTargetUrl } from "@/lib/security/ssrf";

export interface HttpRequestOptions {
  url: string;
  method?: string;
  timeoutMs?: number;
  headers?: Record<string, string>;
  body?: string;
  maxResponseBytes?: number;
}

export interface HttpResponseResult {
  httpStatus: number | null;
  responseTimeMs: number;
  responseHeaders: Record<string, string>;
  responseBody: string;
  error?: string;
  isTimeout: boolean;
  isNetworkError: boolean;
  isSsrfBlocked: boolean;
}

const DEFAULT_TIMEOUT_MS = parseInt(
  process.env.MONITOR_DEFAULT_TIMEOUT_MS || "10000",
  10
);
const DEFAULT_MAX_BYTES = parseInt(
  process.env.MONITOR_MAX_RESPONSE_BYTES || "1048576",
  10
);

/**
 * Executes HTTP request with anti-SSRF pre-flight check, strict timeout,
 * bounded memory response reader, and precise duration calculation.
 */
export async function executeHttpRequest(
  options: HttpRequestOptions
): Promise<HttpResponseResult> {
  const {
    url,
    method = "GET",
    timeoutMs = DEFAULT_TIMEOUT_MS,
    headers = {},
    body,
    maxResponseBytes = DEFAULT_MAX_BYTES,
  } = options;

  // 1. SSRF Validation Pre-flight Check
  const ssrfCheck = await validateTargetUrl(url);
  if (!ssrfCheck.isSafe) {
    return {
      httpStatus: null,
      responseTimeMs: 0,
      responseHeaders: {},
      responseBody: "",
      error: `SSRF_BLOCKED: ${ssrfCheck.error}`,
      isTimeout: false,
      isNetworkError: false,
      isSsrfBlocked: true,
    };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const startTime = performance.now();

  try {
    const fetchOptions: RequestInit = {
      method,
      headers: {
        "User-Agent": "APIWatch-Monitor/1.0 (+https://apiwatch.dev)",
        ...headers,
      },
      signal: controller.signal,
      redirect: "manual", // Prevent unverified SSRF redirects
    };

    if (body && !["GET", "HEAD"].includes(method.toUpperCase())) {
      fetchOptions.body = body;
    }

    const response = await fetch(url, fetchOptions);
    const endTime = performance.now();
    const responseTimeMs = Math.max(1, Math.round(endTime - startTime));

    // Extract headers
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key.toLowerCase()] = value;
    });

    // Read response body with maximum byte bounds
    let responseBody = "";
    if (response.body) {
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let totalBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value) {
          totalBytes += value.byteLength;
          if (totalBytes <= maxResponseBytes) {
            chunks.push(value);
          } else {
            // Reached max allowed bytes, cancel further read to save memory
            await reader.cancel();
            break;
          }
        }
      }

      const merged = new Uint8Array(
        chunks.reduce((acc, c) => acc + c.byteLength, 0)
      );
      let offset = 0;
      for (const chunk of chunks) {
        merged.set(chunk, offset);
        offset += chunk.byteLength;
      }
      responseBody = new TextDecoder("utf-8").decode(merged);
    }

    return {
      httpStatus: response.status,
      responseTimeMs,
      responseHeaders,
      responseBody,
      isTimeout: false,
      isNetworkError: false,
      isSsrfBlocked: false,
    };
  } catch (err: unknown) {
    const endTime = performance.now();
    const responseTimeMs = Math.max(1, Math.round(endTime - startTime));

    if (err instanceof Error && err.name === "AbortError") {
      return {
        httpStatus: null,
        responseTimeMs,
        responseHeaders: {},
        responseBody: "",
        error: `Request timed out after ${timeoutMs}ms`,
        isTimeout: true,
        isNetworkError: false,
        isSsrfBlocked: false,
      };
    }

    const message = err instanceof Error ? err.message : String(err);
    return {
      httpStatus: null,
      responseTimeMs,
      responseHeaders: {},
      responseBody: "",
      error: `Network error: ${message}`,
      isTimeout: false,
      isNetworkError: true,
      isSsrfBlocked: false,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}
