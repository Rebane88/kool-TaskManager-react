/**
 * PriorityProvider unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/priorities/state/PriorityProvider,
 * @/features/priorities/hooks/usePriorities, and
 * @/features/priorities/services/priorityService — none of which exist yet.
 * They are intentionally in RED state until the priority feature module is
 * implemented in Wave 1.
 *
 * Covers:
 *  - PRIO-02: PriorityProvider loads priorities when auth status is authenticated
 *  - PRIO-01: createPriority dispatches PRIORITY_CREATED and adds to state
 *  - PRIO-03: updatePriority dispatches PRIORITY_UPDATED using composed request object
 *             (priorityService.update returns void — provider uses request payload as updated entity)
 *  - PRIO-04: deletePriority dispatches PRIORITY_DELETED and removes from state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { PriorityProvider } from "@/features/priorities/state/PriorityProvider";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import { priorityService } from "@/features/priorities/services/priorityService";

// Mock priorityService — no real API calls in unit tests
vi.mock("@/features/priorities/services/priorityService", () => ({
  priorityService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(), // returns void — provider uses composed request as updated entity
    delete: vi.fn(),
  },
}));

// Mock useAuth — PriorityProvider gates fetch on auth status
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ status: "authenticated" }),
}));

const fakePriority = {
  id: "prio-uuid-1",
  appUserId: "user-uuid-1",
  priorityName: "High",
  prioritySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

let capturedCtx: ReturnType<typeof usePriorities> | null = null;

function TestConsumer() {
  capturedCtx = usePriorities();
  return <div data-testid="priority-status">{capturedCtx.status}</div>;
}

function renderWithProvider() {
  capturedCtx = null;
  return render(
    <PriorityProvider>
      <TestConsumer />
    </PriorityProvider>
  );
}

// ---------------------------------------------------------------------------
// PRIO-02: PriorityProvider initial load
// ---------------------------------------------------------------------------

describe("PriorityProvider: initial load — PRIO-02", () => {
  beforeEach(() => {
    vi.mocked(priorityService.getAll).mockResolvedValue([]);
  });

  it("calls priorityService.getAll when auth status is authenticated", async () => {
    renderWithProvider();
    await act(async () => {});

    expect(priorityService.getAll).toHaveBeenCalled();
  });

  it("sets status to idle after priorities load", async () => {
    renderWithProvider();
    await act(async () => {});

    expect(screen.getByTestId("priority-status").textContent).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// PRIO-01: PriorityProvider createPriority
// ---------------------------------------------------------------------------

describe("PriorityProvider: createPriority — PRIO-01", () => {
  it("dispatches PRIORITY_CREATED and adds priority to state after successful create", async () => {
    vi.mocked(priorityService.create).mockResolvedValue(fakePriority);

    renderWithProvider();
    await act(async () => {
      await capturedCtx!.createPriority({
        id: "prio-uuid-1",
        appUserId: "00000000-0000-0000-0000-000000000000",
        priorityName: "High",
        prioritySort: 0,
        syncDt: "2026-01-01T00:00:00Z",
        tag: null,
      });
    });

    expect(capturedCtx!.priorities).toContainEqual(fakePriority);
  });
});

// ---------------------------------------------------------------------------
// PRIO-03: PriorityProvider updatePriority
// ---------------------------------------------------------------------------

describe("PriorityProvider: updatePriority — PRIO-03", () => {
  it("dispatches PRIORITY_UPDATED using composed request object (priorityService.update returns void)", async () => {
    // Load fakePriority into state first via create
    vi.mocked(priorityService.create).mockResolvedValue(fakePriority);
    // priorityService.update returns void — the provider must use the request payload
    // as the updated entity since the API returns no body (Pitfall 3 pattern)
    vi.mocked(priorityService.update).mockResolvedValue(undefined);

    renderWithProvider();

    // First add the priority to state
    await act(async () => {
      await capturedCtx!.createPriority({
        id: "prio-uuid-1",
        appUserId: "00000000-0000-0000-0000-000000000000",
        priorityName: "High",
        prioritySort: 0,
        syncDt: "2026-01-01T00:00:00Z",
        tag: null,
      });
    });

    // Then update it — provider must derive updated state from request payload
    await act(async () => {
      await capturedCtx!.updatePriority("prio-uuid-1", {
        id: "prio-uuid-1",
        appUserId: "user-uuid-1",
        priorityName: "High Updated",
        prioritySort: 0,
        syncDt: "2026-01-01T00:00:00Z",
        tag: null,
      });
    });

    // The provider updates state from the composed request object (not API response body)
    expect(capturedCtx!.priorities.some((p) => p.priorityName === "High Updated")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PRIO-04: PriorityProvider deletePriority
// ---------------------------------------------------------------------------

describe("PriorityProvider: deletePriority — PRIO-04", () => {
  it("dispatches PRIORITY_DELETED and removes priority from state after successful delete", async () => {
    // Load fakePriority into state first
    vi.mocked(priorityService.create).mockResolvedValue(fakePriority);
    vi.mocked(priorityService.delete).mockResolvedValue(undefined);

    renderWithProvider();

    // Add priority to state
    await act(async () => {
      await capturedCtx!.createPriority({
        id: "prio-uuid-1",
        appUserId: "00000000-0000-0000-0000-000000000000",
        priorityName: "High",
        prioritySort: 0,
        syncDt: "2026-01-01T00:00:00Z",
        tag: null,
      });
    });

    // Delete it
    await act(async () => {
      await capturedCtx!.deletePriority("prio-uuid-1");
    });

    expect(capturedCtx!.priorities).not.toContainEqual(fakePriority);
  });
});
