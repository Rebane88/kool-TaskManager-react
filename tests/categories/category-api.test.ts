/**
 * categoryApi unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/categories/api/categoryApi which does not yet exist.
 * They are intentionally in RED state until categoryApi is implemented in Wave 1.
 *
 * Covers:
 *  - CATE-01: categoryApi.create sends POST with correct body and Bearer token; returns 201
 *  - CATE-02: categoryApi.getAll sends GET with Bearer token, returns TodoCategory[]
 *  - CATE-03: categoryApi.update sends PUT with full body and Bearer token
 *  - CATE-04: categoryApi.delete sends DELETE, handles 204 no-body response (Pitfall 3)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { categoryApi } from "@/features/categories/api/categoryApi";
import {
  setAccessToken,
  clearAccessToken,
} from "@/features/auth/storage/tokenMemoryStore";

// ---------------------------------------------------------------------------
// Fetch mock helper
// ---------------------------------------------------------------------------

function makeFetchMock(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

const fakeCategory = {
  id: "cat-uuid-1",
  categoryName: "Work",
  categorySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

// ---------------------------------------------------------------------------
// CATE-02: categoryApi.getAll
// ---------------------------------------------------------------------------

describe("categoryApi.getAll — CATE-02", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends GET to /api/v1/TodoCategories with Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [fakeCategory],
      text: async () => JSON.stringify([fakeCategory]),
    } as unknown as Response);

    await categoryApi.getAll();

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoCategories");
    expect((init as RequestInit).method).toBe("GET");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("returns array of TodoCategory from response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [fakeCategory],
      text: async () => JSON.stringify([fakeCategory]),
    } as unknown as Response);

    const result = await categoryApi.getAll();

    expect(result).toEqual([fakeCategory]);
  });
});

// ---------------------------------------------------------------------------
// CATE-01: categoryApi.create
// ---------------------------------------------------------------------------

describe("categoryApi.create — CATE-01", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends POST to /api/v1/TodoCategories with request body and Bearer token", async () => {
    const createReq = {
      id: "cat-uuid-1",
      categoryName: "Work",
      categorySort: 0,
      tag: null,
    };

    vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(201, fakeCategory));

    await categoryApi.create(createReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoCategories");
    expect((init as RequestInit).method).toBe("POST");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
    expect((init as RequestInit).body).toBe(JSON.stringify(createReq));
  });

  it("returns created TodoCategory from response body (status 201)", async () => {
    const createReq = {
      id: "cat-uuid-1",
      categoryName: "Work",
      categorySort: 0,
      tag: null,
    };

    vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(201, fakeCategory));

    const result = await categoryApi.create(createReq);

    expect(result).toEqual(fakeCategory);
  });
});

// ---------------------------------------------------------------------------
// CATE-03: categoryApi.update
// ---------------------------------------------------------------------------

describe("categoryApi.update — CATE-03", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends PUT to /api/v1/TodoCategories/{id} with full body and Bearer token", async () => {
    const updateReq = {
      id: "cat-uuid-1",
      categoryName: "Work Updated",
      categorySort: 0,
      tag: null,
      syncDt: "2026-01-01T00:00:00Z",
    };

    const updatedCategory = { ...fakeCategory, categoryName: "Work Updated" };

    vi.spyOn(globalThis, "fetch").mockImplementation(
      makeFetchMock(200, updatedCategory)
    );

    await categoryApi.update("cat-uuid-1", updateReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoCategories/cat-uuid-1");
    expect((init as RequestInit).method).toBe("PUT");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("returns updated TodoCategory from response body", async () => {
    const updateReq = {
      id: "cat-uuid-1",
      categoryName: "Work Updated",
      categorySort: 0,
      tag: null,
      syncDt: "2026-01-01T00:00:00Z",
    };

    const updatedCategory = { ...fakeCategory, categoryName: "Work Updated" };

    vi.spyOn(globalThis, "fetch").mockImplementation(
      makeFetchMock(200, updatedCategory)
    );

    const result = await categoryApi.update("cat-uuid-1", updateReq);

    expect(result).toEqual(updatedCategory);
  });
});

// ---------------------------------------------------------------------------
// CATE-04: categoryApi.delete
// ---------------------------------------------------------------------------

describe("categoryApi.delete — CATE-04", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends DELETE to /api/v1/TodoCategories/{id} with Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(204, null));

    await categoryApi.delete("cat-uuid-1");

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoCategories/cat-uuid-1");
    expect((init as RequestInit).method).toBe("DELETE");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("does not throw when response has no body (204 no content)", async () => {
    // Category DELETE returns 204 with no body — Pitfall 3 pattern
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 204,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    } as unknown as Response);

    await expect(categoryApi.delete("cat-uuid-1")).resolves.not.toThrow();
  });
});
