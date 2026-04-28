import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { apiClient, ApiRequestOptions } from "@/lib/api/apiClient";
import { ApiError } from "@/lib/api/apiError";
import {
  authApi,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  JwtResponse,
} from "@/features/auth/api/authApi";

// ---------------------------------------------------------------------------
// Mock fetch globally
// ---------------------------------------------------------------------------

function makeFetchMock(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

const BASE_URL = "https://taltech.akaver.com";

// ---------------------------------------------------------------------------
// apiClient tests
// ---------------------------------------------------------------------------

describe("apiClient: centralized native-fetch transport (ARCH-02)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("uses native fetch (not XMLHttpRequest or any other transport)", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ result: "ok" }),
      text: async () => '{"result":"ok"}',
    } as unknown as Response);

    await apiClient({ method: "GET", url: `${BASE_URL}/api/v1/Account/Login` });

    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it("sends request to the exact URL provided", async () => {
    const targetUrl = `${BASE_URL}/api/v1/Account/Register`;
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    } as unknown as Response);

    await apiClient({ method: "POST", url: targetUrl, body: {} });

    expect(fetchSpy).toHaveBeenCalledWith(
      targetUrl,
      expect.objectContaining({ method: "POST" })
    );
  });

  it("sets Content-Type application/json when body is present", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    } as unknown as Response);

    await apiClient({
      method: "POST",
      url: `${BASE_URL}/api/v1/Account/Login`,
      body: { email: "a@b.com", password: "x" },
    });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("serializes body as JSON string", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    } as unknown as Response);

    const payload = { email: "test@test.com", password: "pass" };
    await apiClient({
      method: "POST",
      url: `${BASE_URL}/api/v1/Account/Login`,
      body: payload,
    });

    const [, init] = fetchSpy.mock.calls[0];
    expect((init as RequestInit).body).toBe(JSON.stringify(payload));
  });

  it("sends Authorization header when accessToken is provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    } as unknown as Response);

    await apiClient({
      method: "GET",
      url: `${BASE_URL}/api/v1/TodoTask`,
      accessToken: "test-jwt",
    });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers["Authorization"]).toBe("Bearer test-jwt");
  });

  it("does not include Authorization header when no accessToken is provided", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({}),
      text: async () => "{}",
    } as unknown as Response);

    await apiClient({ method: "GET", url: `${BASE_URL}/api/v1/Account/Login` });

    const [, init] = fetchSpy.mock.calls[0];
    const headers = (init as RequestInit).headers as Record<string, string>;
    expect(headers?.["Authorization"]).toBeUndefined();
  });

  it("returns parsed JSON data on success", async () => {
    const responseData = { token: "jwt-access", refreshToken: "refresh-123" };
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => responseData,
      text: async () => JSON.stringify(responseData),
    } as unknown as Response);

    const result = await apiClient({
      method: "POST",
      url: `${BASE_URL}/api/v1/Account/Login`,
      body: {},
    });

    expect(result).toEqual(responseData);
  });
});

// ---------------------------------------------------------------------------
// ApiError normalization tests
// ---------------------------------------------------------------------------

describe("ApiError: normalized error shape", () => {
  it("is an instance of Error", () => {
    const err = new ApiError(400, "Bad request", "Invalid credentials");
    expect(err).toBeInstanceOf(Error);
  });

  it("exposes status, message, and detail properties", () => {
    const err = new ApiError(404, "Not Found", "User not found");
    expect(err.status).toBe(404);
    expect(err.message).toBe("Not Found");
    expect(err.detail).toBe("User not found");
  });

  it("detail defaults to undefined when not provided", () => {
    const err = new ApiError(500, "Server Error");
    expect(err.detail).toBeUndefined();
  });
});

describe("apiClient: error normalization via ApiError", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("throws ApiError on non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "User not found" }),
      text: async () => JSON.stringify({ message: "User not found" }),
    } as unknown as Response);

    await expect(
      apiClient({ method: "POST", url: `${BASE_URL}/api/v1/Account/Login`, body: {} })
    ).rejects.toThrow(ApiError);
  });

  it("ApiError has correct status on non-2xx response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: "Unauthorized" }),
      text: async () => JSON.stringify({ message: "Unauthorized" }),
    } as unknown as Response);

    let caught: ApiError | null = null;
    try {
      await apiClient({ method: "POST", url: `${BASE_URL}/api/v1/Account/Login`, body: {} });
    } catch (e) {
      caught = e as ApiError;
    }

    expect(caught).not.toBeNull();
    expect(caught!.status).toBe(401);
  });

  it("throws ApiError on network failure", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new TypeError("Failed to fetch"));

    await expect(
      apiClient({ method: "POST", url: `${BASE_URL}/api/v1/Account/Login`, body: {} })
    ).rejects.toThrow(ApiError);
  });

  it("does not retry on failure (controlled failure, no implicit retry loop)", async () => {
    let callCount = 0;
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => {
      callCount++;
      return {
        ok: false,
        status: 500,
        json: async () => ({ message: "Server Error" }),
        text: async () => JSON.stringify({ message: "Server Error" }),
      } as unknown as Response;
    });

    try {
      await apiClient({ method: "GET", url: `${BASE_URL}/api/v1/Account/Login` });
    } catch (_) {
      // expected
    }

    expect(callCount).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// authApi wrapper tests
// ---------------------------------------------------------------------------

describe("authApi: register/login/refresh route through apiClient only (ARCH-02)", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const jwtResponse: JwtResponse = {
    token: "access-token-123",
    refreshToken: "refresh-token-abc",
    firstName: "John",
    lastName: "Doe",
  };

  it("register sends POST to Account/Register endpoint with correct body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jwtResponse,
      text: async () => JSON.stringify(jwtResponse),
    } as unknown as Response);

    const req: RegisterRequest = {
      email: "john@example.com",
      password: "secret",
      firstName: "John",
      lastName: "Doe",
    };
    await authApi.register(req);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("Account/Register");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(JSON.stringify(req));
  });

  it("login sends POST to Account/Login endpoint with correct body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jwtResponse,
      text: async () => JSON.stringify(jwtResponse),
    } as unknown as Response);

    const req: LoginRequest = { email: "john@example.com", password: "secret" };
    await authApi.login(req);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("Account/Login");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(JSON.stringify(req));
  });

  it("refresh sends POST to Account/RefreshToken with jwt + refreshToken body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jwtResponse,
      text: async () => JSON.stringify(jwtResponse),
    } as unknown as Response);

    const req: RefreshTokenRequest = {
      jwt: "old-access-token",
      refreshToken: "old-refresh-token",
    };
    await authApi.refresh(req);

    expect(fetchSpy).toHaveBeenCalledOnce();
    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toContain("Account/RefreshToken");
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).body).toBe(JSON.stringify(req));
  });

  it("register returns JwtResponse shape on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jwtResponse,
      text: async () => JSON.stringify(jwtResponse),
    } as unknown as Response);

    const result = await authApi.register({
      email: "x@x.com",
      password: "p",
      firstName: "X",
      lastName: "Y",
    });

    expect(result).toEqual(jwtResponse);
  });

  it("login returns JwtResponse shape on success", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => jwtResponse,
      text: async () => JSON.stringify(jwtResponse),
    } as unknown as Response);

    const result = await authApi.login({ email: "x@x.com", password: "p" });

    expect(result).toEqual(jwtResponse);
  });

  it("register propagates ApiError on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ message: "Email already in use" }),
      text: async () => JSON.stringify({ message: "Email already in use" }),
    } as unknown as Response);

    await expect(
      authApi.register({ email: "x@x.com", password: "p", firstName: "X", lastName: "Y" })
    ).rejects.toThrow(ApiError);
  });

  it("login propagates ApiError on invalid credentials", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ message: "Invalid credentials" }),
      text: async () => JSON.stringify({ message: "Invalid credentials" }),
    } as unknown as Response);

    await expect(
      authApi.login({ email: "x@x.com", password: "wrong" })
    ).rejects.toThrow(ApiError);
  });
});
