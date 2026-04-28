/**
 * DashboardPage test stubs — Wave 0 (RED state)
 *
 * These tests import useCategories and usePriorities which are not yet imported
 * into DashboardPage. They define the D-07 prerequisite banner contract that
 * Plan 05 must satisfy.
 *
 * Covers:
 *  - D-07: Prerequisite banner shown when no categories or no priorities exist
 *  - D-07: Banner hidden when both categories and priorities are non-empty
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import DashboardPage from "@/app/(app)/dashboard/page";

vi.mock("@/features/categories/hooks/useCategories");
vi.mock("@/features/priorities/hooks/usePriorities");
vi.mock("@/features/tasks/hooks/useTasks", () => ({
  useTasks: () => ({
    tasks: [],
    status: "idle",
    error: null,
    createTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
  }),
}));

const fakeCategory = {
  id: "c1",
  categoryName: "Work",
  categorySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};
const fakePriority = {
  id: "p1",
  appUserId: "u1",
  priorityName: "High",
  prioritySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

// ---------------------------------------------------------------------------
// D-07: Prerequisite banner
// ---------------------------------------------------------------------------

describe("DashboardPage — D-07: prerequisite banner", () => {
  it("shows prerequisite banner when no categories exist", () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [],
      status: "idle",
      error: null,
      loadCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    });
    vi.mocked(usePriorities).mockReturnValue({
      priorities: [fakePriority],
      status: "idle",
      error: null,
      loadPriorities: vi.fn(),
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<DashboardPage />);
    expect(screen.getByText(/category/i)).toBeTruthy();
  });

  it("shows prerequisite banner when no priorities exist", () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [fakeCategory],
      status: "idle",
      error: null,
      loadCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    });
    vi.mocked(usePriorities).mockReturnValue({
      priorities: [],
      status: "idle",
      error: null,
      loadPriorities: vi.fn(),
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<DashboardPage />);
    expect(screen.getByText(/priority/i)).toBeTruthy();
  });

  it("hides prerequisite banner when both categories and priorities lists are non-empty", () => {
    vi.mocked(useCategories).mockReturnValue({
      categories: [fakeCategory],
      status: "idle",
      error: null,
      loadCategories: vi.fn(),
      createCategory: vi.fn(),
      updateCategory: vi.fn(),
      deleteCategory: vi.fn(),
    });
    vi.mocked(usePriorities).mockReturnValue({
      priorities: [fakePriority],
      status: "idle",
      error: null,
      loadPriorities: vi.fn(),
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<DashboardPage />);
    expect(screen.queryByText(/first add a/i)).toBeNull();
  });
});
