import { ApiClientError } from "./error";

interface RequestOptions extends Omit<RequestInit, "body"> {
  params?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>
  ): string {
    const url = new URL(endpoint, this.baseUrl || "http://localhost");

    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          url.searchParams.append(key, String(val));
        }
      });
    }

    if (!this.baseUrl) {
      return url.pathname + url.search;
    }

    return url.toString();
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<{ data: T; meta?: Record<string, unknown> }> {
    const { params, body, headers = {}, ...customConfig } = options;

    const fullUrl = this.buildUrl(endpoint, params);

    const config: RequestInit = {
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      ...customConfig,
    };

    if (body !== undefined) {
      config.body = typeof body === "string" ? body : JSON.stringify(body);
    }

    let response: Response;
    try {
      response = await fetch(fullUrl, config);
    } catch (networkError: unknown) {
      const msg = networkError instanceof Error ? networkError.message : "Network request failed";
      throw new ApiClientError(msg, "NETWORK_ERROR", 0);
    }

    // Try parsing JSON
    let result: ApiResponse<T> | null = null;
    const text = await response.text();
    if (text) {
      try {
        result = JSON.parse(text) as ApiResponse<T>;
      } catch {
        // Non-JSON response
      }
    }

    if (!response.ok || (result && result.success === false)) {
      const message =
        result?.error?.message ||
        response.statusText ||
        `Request failed with status ${response.status}`;
      const code = result?.error?.code || `HTTP_${response.status}`;
      const details = result?.error?.details;

      throw new ApiClientError(message, code, response.status, details);
    }

    if (result && "data" in result) {
      return { data: result.data as T, meta: result.meta };
    }

    return { data: (result as unknown as T) || ({} as T) };
  }

  get<T>(endpoint: string, params?: RequestOptions["params"], config?: Omit<RequestOptions, "params">) {
    return this.request<T>(endpoint, { method: "GET", params, ...config });
  }

  post<T>(endpoint: string, body?: unknown, config?: Omit<RequestOptions, "body">) {
    return this.request<T>(endpoint, { method: "POST", body, ...config });
  }

  patch<T>(endpoint: string, body?: unknown, config?: Omit<RequestOptions, "body">) {
    return this.request<T>(endpoint, { method: "PATCH", body, ...config });
  }

  delete<T>(endpoint: string, config?: RequestOptions) {
    return this.request<T>(endpoint, { method: "DELETE", ...config });
  }
}

export const apiClient = new ApiClient();
