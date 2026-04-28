/**
 * Normalized API error shape.
 *
 * All transport failures from apiClient are mapped into ApiError so downstream
 * auth flows receive consistent failure semantics (T-01-05).
 *
 * Fields:
 *  status  — HTTP status code, or 0 for network-level failures.
 *  message — Developer string e.g. "HTTP 422" — do not show directly to users.
 *  detail  — API prose description — prefer this for user-facing messages.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly detail: string | undefined;

  constructor(status: number, message: string, detail?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
    // Restore prototype chain for instanceof checks across transpilation boundaries
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

function humanizeStatus(status: number): string {
  if (status === 0) return "Network error. Check your connection and try again.";
  if (status === 401) return "Your session has expired. Please log in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "Not found.";
  if (status === 422) return "The server rejected your input. Please check your entries.";
  if (status >= 500) return "Server error. Please try again in a moment.";
  return `Request failed (${status}). Please try again.`;
}

/**
 * Converts any caught error into a user-facing string.
 * Prefers the API's detail prose over the bare HTTP status code.
 * Falls back to `fallback` only if the error carries no useful message.
 */
export function formatApiError(err: unknown, fallback: string): string {
  if (err instanceof ApiError) {
    return err.detail ?? humanizeStatus(err.status);
  }
  return err instanceof Error ? err.message : fallback;
}
