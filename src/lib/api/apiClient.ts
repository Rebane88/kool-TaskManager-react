/**
 * Centralized native-fetch transport for all API calls.
 *
 * All auth and feature HTTP traffic MUST go through this function (ARCH-02).
 * No component or service may call fetch() directly.
 *
 * Security notes (T-01-05, T-01-06):
 *  - One request pipeline with typed normalization prevents inconsistent mutation paths.
 *  - No implicit retry loops — failures return controlled ApiError to callers.
 */

import { ApiError } from "./apiError";

export interface ApiRequestOptions {
  /** HTTP method */
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Full URL including base and path */
  url: string;
  /** Request body — will be JSON-serialized if present */
  body?: unknown;
  /** Access token for Bearer authorization header injection */
  accessToken?: string;
  /** Additional request headers */
  headers?: Record<string, string>;
}

/**
 * Execute an HTTP request using native fetch.
 *
 * Returns parsed JSON response on success.
 * Throws ApiError on any non-2xx response or network failure.
 * Never retries — callers are responsible for retry logic (T-01-06).
 */
export async function apiClient<T = unknown>(options: ApiRequestOptions): Promise<T> {
  const { method, url, body, accessToken, headers: extraHeaders } = options;

  const headers: Record<string, string> = {
    ...(extraHeaders ?? {}),
  };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    // Network-level failure (DNS failure, connection refused, etc.)
    const message =
      networkError instanceof Error ? networkError.message : "Network error";
    throw new ApiError(0, message);
  }

  if (!response.ok) {
    // Normalize non-2xx HTTP responses into ApiError (T-01-04)
    let detail: string | undefined;
    try {
      const errorBody = (await response.json()) as { message?: string };
      detail = errorBody?.message;
    } catch {
      // Body not parseable — omit detail
    }
    throw new ApiError(
      response.status,
      `HTTP ${response.status}`,
      detail
    );
  }

  return response.json() as Promise<T>;
}
