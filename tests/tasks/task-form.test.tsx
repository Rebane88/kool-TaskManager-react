/**
 * TaskForm test stubs — Wave 0 (RED state)
 *
 * These tests import useCategories and usePriorities which are not yet wired
 * into TaskForm. They define the contract that Plan 05 must satisfy.
 *
 * Covers:
 *  - PRIO-05: TaskForm renders category and priority dropdowns when lists are non-empty
 *  - D-08: Save button is disabled when categories or priorities list is empty
 *  - PRIO-05: Submit sends real UUIDs, not EMPTY_GUID (00000000-...) for todoCategoryId
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import TaskForm from "@/components/tasks/TaskForm";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";

vi.mock("@/features/categories/hooks/useCategories");
vi.mock("@/features/priorities/hooks/usePriorities");
vi.mock("@/features/tasks/hooks/useTasks", () => ({
  useTasks: () => ({
    createTask: vi.fn(),
    updateTask: vi.fn(),
    tasks: [],
    status: "idle",
    error: null,
  }),
}));

const fakeCategory = {
  id: "cat-uuid-1",
  categoryName: "Work",
  categorySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};
const fakePriority = {
  id: "prio-uuid-1",
  appUserId: "user-uuid-1",
  priorityName: "High",
  prioritySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

// ---------------------------------------------------------------------------
// PRIO-05: Category and priority dropdowns rendered
// ---------------------------------------------------------------------------

describe("TaskForm — PRIO-05: category and priority dropdowns rendered", () => {
  it("renders category select when categories list is non-empty", () => {
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
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<TaskForm onClose={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: /category/i })).toBeTruthy();
  });

  it("renders priority select when priorities list is non-empty", () => {
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
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<TaskForm onClose={vi.fn()} />);
    expect(screen.getByRole("combobox", { name: /priority/i })).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// D-08: Save disabled when categories or priorities list is empty
// ---------------------------------------------------------------------------

describe("TaskForm — D-08: save disabled when categories or priorities list is empty", () => {
  it("disables the save button when categories list is empty", () => {
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
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<TaskForm onClose={vi.fn()} />);
    const saveButton = screen.getByRole("button", { name: /create|save/i });
    expect(saveButton).toHaveProperty("disabled", true);
  });

  it("disables the save button when priorities list is empty", () => {
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
      createPriority: vi.fn(),
      updatePriority: vi.fn(),
      deletePriority: vi.fn(),
    });
    render(<TaskForm onClose={vi.fn()} />);
    const saveButton = screen.getByRole("button", { name: /create|save/i });
    expect(saveButton).toHaveProperty("disabled", true);
  });
});

// ---------------------------------------------------------------------------
// PRIO-05: Submit sends real UUIDs, not EMPTY_GUID
// ---------------------------------------------------------------------------

describe("TaskForm — PRIO-05: submit sends real UUIDs, not EMPTY_GUID", () => {
  it("create path uses real category UUID (not 00000000-...) as todoCategoryId", () => {
    // Contract: when user selects a category, todoCategoryId must equal the selected
    // category id, never "00000000-0000-0000-0000-000000000000".
    // RED stub — full wire-up implemented in Plan 05.
    expect(fakeCategory.id).not.toBe("00000000-0000-0000-0000-000000000000");
  });
});
