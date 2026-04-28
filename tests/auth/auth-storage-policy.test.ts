import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
} from "@/features/auth/storage/tokenMemoryStore";
import {
  setRefreshToken,
  getRefreshToken,
  clearRefreshToken,
  REFRESH_TOKEN_KEY,
} from "@/features/auth/storage/refreshTokenStorage";

describe("auth-storage-policy: access token (memory only)", () => {
  beforeEach(() => {
    clearAccessToken();
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("stores and retrieves the access token from memory", () => {
    setAccessToken("test-jwt-access-token");
    expect(getAccessToken()).toBe("test-jwt-access-token");
  });

  it("returns null when no access token is set", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("clears the access token", () => {
    setAccessToken("test-jwt-access-token");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });

  it("never writes access token to localStorage", () => {
    const setItemSpy = vi.spyOn(localStorage, "setItem");
    setAccessToken("secret-access-jwt");
    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it("never reads access token from localStorage", () => {
    const getItemSpy = vi.spyOn(localStorage, "getItem");
    getAccessToken();
    expect(getItemSpy).not.toHaveBeenCalled();
  });

  it("never removes access token from localStorage", () => {
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");
    clearAccessToken();
    expect(removeItemSpy).not.toHaveBeenCalled();
  });
});

describe("auth-storage-policy: refresh token (localStorage)", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("stores the refresh token in localStorage", () => {
    setRefreshToken("test-refresh-token");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("test-refresh-token");
  });

  it("retrieves the refresh token from localStorage", () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, "stored-refresh-token");
    expect(getRefreshToken()).toBe("stored-refresh-token");
  });

  it("returns null when no refresh token is stored", () => {
    expect(getRefreshToken()).toBeNull();
  });

  it("clears the refresh token by removing the exact storage key", () => {
    localStorage.setItem(REFRESH_TOKEN_KEY, "test-refresh-token");
    clearRefreshToken();
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
  });

  it("uses localStorage.setItem to persist the refresh token", () => {
    const setItemSpy = vi.spyOn(localStorage, "setItem");
    setRefreshToken("test-refresh-token");
    expect(setItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY, "test-refresh-token");
  });

  it("uses localStorage.getItem to retrieve the refresh token", () => {
    const getItemSpy = vi.spyOn(localStorage, "getItem");
    getRefreshToken();
    expect(getItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });

  it("uses localStorage.removeItem to clear the refresh token", () => {
    const removeItemSpy = vi.spyOn(localStorage, "removeItem");
    clearRefreshToken();
    expect(removeItemSpy).toHaveBeenCalledWith(REFRESH_TOKEN_KEY);
  });
});
