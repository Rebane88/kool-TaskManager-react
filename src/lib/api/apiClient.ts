/**
 * Centralized native-fetch transport for all API calls.
 *
 * All auth and feature HTTP traffic MUST go through this function (ARCH-02).
 * No component or service may call fetch() directly.
 *
 * Security notes (T-01-05, T-01-06, T-01-09):
 *  - One request pipeline with typed normalization prevents inconsistent mutation paths.
 *  - No implicit retry loops — failures return controlled ApiError to callers.
 *  - On 401: calls registered handler once to obtain a new access token, then retries
 *    the original request exactly once. If the retry fails again, throws ApiError (D-03).
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

// ---------------------------------------------------------------------------
// 401 handler injection (D-03 / T-01-09)
// ---------------------------------------------------------------------------

/**
 * Callback invoked when a 401 is received on an authenticated request.
 * Should perform token refresh and return the new access token string.
 * Throwing from this callback aborts the retry — no second fetch is made.
 */
type UnauthorizedHandler = (() => Promise<string>) | null;

let unauthorizedHandler: UnauthorizedHandler = null;

/**
 * Register (or clear) the 401 unauthorized handler.
 *
 * Typically called once during app initialization by the auth layer so that
 * apiClient can trigger token refresh without directly depending on authService.
 *
 * Pass `null` to remove any registered handler (disables 401 recovery).
 */
export function setUnauthorizedHandler(handler: UnauthorizedHandler): void {
  unauthorizedHandler = handler;
}

// ---------------------------------------------------------------------------
// Internal fetch helper
// ---------------------------------------------------------------------------

async function executeFetch(
  method: string,
  url: string,
  headers: Record<string, string>,
  body: unknown
): Promise<Response> {
  return fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}

function buildHeaders(
  body: unknown,
  accessToken: string | undefined,
  extraHeaders?: Record<string, string>
): Record<string, string> {
  const headers: Record<string, string> = { ...(extraHeaders ?? {}) };
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (accessToken) {
    headers["Authorization"] = `Bearer ${accessToken}`;
  }
  return headers;
}

async function parseApiError(response: Response): Promise<ApiError> {
  let detail: string | undefined;
  try {
    const errorBody = (await response.json()) as { message?: string };
    detail = errorBody?.message;
  } catch {
    // Body not parseable — omit detail
  }
  return new ApiError(response.status, `HTTP ${response.status}`, detail);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Execute an HTTP request using native fetch.
 *
 * Returns parsed JSON response on success.
 * Throws ApiError on any non-2xx response or network failure.
 *
 * On 401 with a registered handler:
 *   1. Calls the handler to obtain a new access token.
 *   2. Retries the original request once with the new token.
 *   3. If the retry also fails, throws ApiError — no further retries (D-03 / T-01-09).
 *
 * Never retries on other error statuses (T-01-06).
 */
export async function apiClient<T = unknown>(options: ApiRequestOptions): Promise<T> {
  const { method, url, body, accessToken, headers: extraHeaders } = options;

  const headers = buildHeaders(body, accessToken, extraHeaders);

  let response: Response;
  try {
    response = await executeFetch(method, url, headers, body);
  } catch (networkError) {
    // Network-level failure (DNS failure, connection refused, etc.)
    const message =
      networkError instanceof Error ? networkError.message : "Network error";
    throw new ApiError(0, message);
  }

  // ---------------------------------------------------------------------------
  // 401 interception + single retry (D-03 / T-01-09)
  // ---------------------------------------------------------------------------

  if (response.status === 401 && unauthorizedHandler !== null) {
    let newAccessToken: string;
    try {
      newAccessToken = await unauthorizedHandler();
    } catch (handlerError) {
      // Handler threw (e.g. refresh failed) — do NOT retry, propagate error
      throw handlerError;
    }

    // Retry original request with the new access token (exactly once)
    const retryHeaders = buildHeaders(body, newAccessToken, extraHeaders);
    let retryResponse: Response;
    try {
      retryResponse = await executeFetch(method, url, retryHeaders, body);
    } catch (networkError) {
      const message =
        networkError instanceof Error ? networkError.message : "Network error";
      throw new ApiError(0, message);
    }

    if (!retryResponse.ok) {
      throw await parseApiError(retryResponse);
    }

    try {
      return (await retryResponse.json()) as T;
    } catch {
      return undefined as unknown as T;
    }
  }

  if (!response.ok) {
    throw await parseApiError(response);
  }

  // Guard against responses with no body (e.g. DELETE returns HTTP 200 with empty body).
  // Attempting response.json() on an empty body rejects with SyntaxError — we catch the
  // rejection and return undefined instead. Callers that use apiClient<unknown> and discard
  // the result handle this safely (Pitfall 3 guard).
  try {
    return (await response.json()) as T;
  } catch {
    return undefined as unknown as T;
  }
}
