/**
 * TaskCard unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/components/tasks/TaskCard which does not yet exist.
 * They are intentionally in RED state until TaskCard is implemented in Wave 1.
 *
 * Covers:
 *  - TASK-02: TaskCard renders the task name and due date
 *  - TASK-05: Completed task renders with strikethrough class and opacity-60 (D-05)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mock useTasks — TaskCard reads toggleComplete from context
// ---------------------------------------------------------------------------

const mockUseTasks = vi.fn();
vi.mock("@/features/tasks/hooks/useTasks", () => ({
  useTasks: () => mockUseTasks(),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import TaskCard from "@/components/tasks/TaskCard";

// ---------------------------------------------------------------------------
// Task fixture helper
// ---------------------------------------------------------------------------

function makeTask(
  overrides: Partial<{
    id: string;
    taskName: string;
    isCompleted: boolean;
    dueDt: string | null;
  }> = {}
) {
  return {
    id: "task-1",
    taskName: "Test task",
    taskSort: 0,
    createdDt: "2026-01-01T00:00:00Z",
    dueDt: null,
    isCompleted: false,
    isArchived: false,
    todoCategoryId: null,
    todoPriorityId: null,
    syncDt: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// TASK-02: TaskCard task name rendering
// ---------------------------------------------------------------------------

describe("TaskCard: task name rendering — TASK-02", () => {
  beforeEach(() => {
    mockUseTasks.mockReturnValue({ toggleComplete: vi.fn() });
  });

  it("renders the task name", () => {
    const task = makeTask({ taskName: "My important task" });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText("My important task")).toBeDefined();
  });

  it("renders due date when dueDt is set", () => {
    const task = makeTask({ dueDt: "2026-12-31T00:00:00Z" });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    // The formatted due date element should be in the DOM
    // (exact format depends on implementation: "Dec 31", "Tomorrow", etc.)
    const card = screen.getByText("Test task").closest("[data-testid]") ?? screen.getByText("Test task").parentElement?.parentElement;
    expect(card).toBeDefined();
    // Due date text should be rendered — any non-empty text near the task
    const dueDateEl = screen.getByText(/Dec|2026|Tomorrow|Today/);
    expect(dueDateEl).toBeDefined();
  });

  it("does not render due date section when dueDt is null", () => {
    const task = makeTask({ dueDt: null });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    // No date text should appear — only task name, edit, delete
    expect(screen.queryByText(/Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// TASK-05: TaskCard completed task style (D-05)
// ---------------------------------------------------------------------------

describe("TaskCard: completed task style — TASK-05", () => {
  beforeEach(() => {
    mockUseTasks.mockReturnValue({ toggleComplete: vi.fn() });
  });

  it("applies line-through class to task name when isCompleted is true", () => {
    const task = makeTask({ isCompleted: true });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const nameEl = screen.getByText("Test task");
    expect(nameEl.className).toContain("line-through");
  });

  it("applies opacity-60 class to card when isCompleted is true", () => {
    const task = makeTask({ isCompleted: true, taskName: "Done task" });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const nameEl = screen.getByText("Done task");
    // Walk up to find the card wrapper that has opacity-60
    const card = nameEl.closest(".opacity-60");
    expect(card).not.toBeNull();
  });

  it("does not apply line-through class when isCompleted is false", () => {
    const task = makeTask({ isCompleted: false });
    render(<TaskCard task={task} onEdit={vi.fn()} onDelete={vi.fn()} />);
    const nameEl = screen.getByText("Test task");
    expect(nameEl.className).not.toContain("line-through");
  });
});
