/**
 * priorityApi unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/priorities/api/priorityApi which does not yet exist.
 * They are intentionally in RED state until priorityApi is implemented in Wave 1.
 *
 * Covers:
 *  - PRIO-01: priorityApi.create sends POST with correct body and Bearer token; returns 200 (not 201)
 *  - PRIO-02: priorityApi.getAll sends GET with Bearer token, returns TodoPriority[]
 *  - PRIO-03: priorityApi.update sends PUT with full body; PUT returns 200 with no body (Pitfall 3)
 *  - PRIO-04: priorityApi.delete sends DELETE; DELETE returns 200 with no body (Pitfall 3)
 *
 * IMPORTANT ASYMMETRIES vs categoryApi:
 *  - Priority POST returns 200 (not 201 like category POST)
 *  - Priority PUT returns 200 with no body — use apiClient<unknown> and discard result
 *  - Priority DELETE returns 200 (not 204 like category DELETE)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { priorityApi } from "@/features/priorities/api/priorityApi";
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

const fakePriority = {
  id: "prio-uuid-1",
  appUserId: "user-uuid-1",
  priorityName: "High",
  prioritySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

// ---------------------------------------------------------------------------
// PRIO-02: priorityApi.getAll
// ---------------------------------------------------------------------------

describe("priorityApi.getAll — PRIO-02", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends GET to /api/v1/TodoPriorities with Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [fakePriority],
      text: async () => JSON.stringify([fakePriority]),
    } as unknown as Response);

    await priorityApi.getAll();

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoPriorities");
    expect((init as RequestInit).method).toBe("GET");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("returns array of TodoPriority from response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => [fakePriority],
      text: async () => JSON.stringify([fakePriority]),
    } as unknown as Response);

    const result = await priorityApi.getAll();

    expect(result).toEqual([fakePriority]);
  });
});

// ---------------------------------------------------------------------------
// PRIO-01: priorityApi.create
// ---------------------------------------------------------------------------

describe("priorityApi.create — PRIO-01", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends POST to /api/v1/TodoPriorities with request body and Bearer token", async () => {
    const createReq = {
      id: "prio-uuid-1",
      appUserId: "00000000-0000-0000-0000-000000000000",
      priorityName: "High",
      prioritySort: 0,
      syncDt: "2026-01-01T00:00:00Z",
      tag: null,
    };

    // Note: priority POST returns 200 (not 201 like category POST)
    vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(200, fakePriority));

    await priorityApi.create(createReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoPriorities");
    expect((init as RequestInit).method).toBe("POST");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
    expect((init as RequestInit).body).toBe(JSON.stringify(createReq));
  });

  it("returns created TodoPriority from response body (status 200, not 201)", async () => {
    // Note: priority POST returns 200 (not 201) — this differs from category create
    const createReq = {
      id: "prio-uuid-1",
      appUserId: "00000000-0000-0000-0000-000000000000",
      priorityName: "High",
      prioritySort: 0,
      syncDt: "2026-01-01T00:00:00Z",
      tag: null,
    };

    vi.spyOn(globalThis, "fetch").mockImplementation(makeFetchMock(200, fakePriority));

    const result = await priorityApi.create(createReq);

    expect(result).toEqual(fakePriority);
  });
});

// ---------------------------------------------------------------------------
// PRIO-03: priorityApi.update
// ---------------------------------------------------------------------------

describe("priorityApi.update — PRIO-03", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends PUT to /api/v1/TodoPriorities/{id} with full body and Bearer token", async () => {
    const updateReq = {
      id: "prio-uuid-1",
      appUserId: "user-uuid-1",
      priorityName: "High Updated",
      prioritySort: 0,
      syncDt: "2026-01-01T00:00:00Z",
      tag: null,
    };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    } as unknown as Response);

    await priorityApi.update("prio-uuid-1", updateReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoPriorities/prio-uuid-1");
    expect((init as RequestInit).method).toBe("PUT");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("does not return a body (PUT returns 200 with no body — use apiClient<unknown>)", async () => {
    const updateReq = {
      id: "prio-uuid-1",
      appUserId: "user-uuid-1",
      priorityName: "High Updated",
      prioritySort: 0,
      syncDt: "2026-01-01T00:00:00Z",
      tag: null,
    };

    // priority PUT returns 200 with no body — Pitfall 3 pattern
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    } as unknown as Response);

    await expect(priorityApi.update("prio-uuid-1", updateReq)).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// PRIO-04: priorityApi.delete
// ---------------------------------------------------------------------------

describe("priorityApi.delete — PRIO-04", () => {
  beforeEach(() => {
    setAccessToken("test-token");
  });
  afterEach(() => {
    vi.restoreAllMocks();
    clearAccessToken();
  });

  it("sends DELETE to /api/v1/TodoPriorities/{id} with Bearer token", async () => {
    // Note: priority DELETE returns 200 (not 204 like category DELETE)
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => null,
      text: async () => "",
    } as unknown as Response);

    await priorityApi.delete("prio-uuid-1");

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoPriorities/prio-uuid-1");
    expect((init as RequestInit).method).toBe("DELETE");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("does not throw when response has no body (200 no content)", async () => {
    // Priority DELETE returns 200 with no body — Pitfall 3 pattern
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    } as unknown as Response);

    await expect(priorityApi.delete("prio-uuid-1")).resolves.not.toThrow();
  });
});
