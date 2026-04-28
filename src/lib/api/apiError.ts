/**
 * Normalized API error shape.
 *
 * All transport failures from apiClient are mapped into ApiError so downstream
 * auth flows receive consistent failure semantics (T-01-05).
 *
 * Fields:
 *  status  — HTTP status code, or 0 for network-level failures.
 *  message — Human-readable summary (sourced from response body or error message).
 *  detail  — Optional additional detail from the API error envelope.
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
