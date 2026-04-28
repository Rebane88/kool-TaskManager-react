/**
 * TaskProvider unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/tasks/state/TaskProvider and
 * @/features/tasks/services/taskService — neither module exists yet.
 * They are intentionally in RED state until implementations are created in Wave 1.
 *
 * Covers:
 *  - TASK-02: TaskProvider initial load calls taskService.getAll when authenticated
 *  - TASK-01: TaskProvider dispatches TASK_CREATED after successful create
 *  - TASK-03: TaskProvider dispatches TASK_UPDATED after successful update
 *  - TASK-04: TaskProvider dispatches TASK_DELETED after successful delete
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";

// ---------------------------------------------------------------------------
// Mock taskService — no real API calls in unit tests
// ---------------------------------------------------------------------------

vi.mock("@/features/tasks/services/taskService", () => ({
  taskService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// ---------------------------------------------------------------------------
// Mock useAuth — TaskProvider gates fetch on auth status
// ---------------------------------------------------------------------------

vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: vi.fn(() => ({ status: "authenticated" })),
}));

// ---------------------------------------------------------------------------
// Imports (after mocks)
// ---------------------------------------------------------------------------

import { TaskProvider } from "@/features/tasks/state/TaskProvider";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { taskService } from "@/features/tasks/services/taskService";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ---------------------------------------------------------------------------
// Helper: TestConsumer + renderWithProvider
// ---------------------------------------------------------------------------

let capturedCtx: ReturnType<typeof useTasks> | null = null;

function TestConsumer() {
  capturedCtx = useTasks();
  return <div data-testid="task-state">{capturedCtx.status}</div>;
}

function renderWithProvider() {
  capturedCtx = null;
  return render(
    <TaskProvider>
      <TestConsumer />
    </TaskProvider>
  );
}

// ---------------------------------------------------------------------------
// Shared task fixture
// ---------------------------------------------------------------------------

const newTask = {
  id: "task-uuid-1",
  taskName: "Test task",
  taskSort: 0,
  createdDt: "2026-01-01T00:00:00Z",
  dueDt: null,
  isCompleted: false,
  isArchived: false,
  todoCategoryId: "00000000-0000-0000-0000-000000000000",
  todoPriorityId: "00000000-0000-0000-0000-000000000000",
  syncDt: "2026-01-01T00:00:00Z",
};

// ---------------------------------------------------------------------------
// TASK-02: TaskProvider initial load
// ---------------------------------------------------------------------------

describe("TaskProvider: initial load — TASK-02", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(taskService.getAll).mockResolvedValue([]);
    vi.mocked(useAuth).mockReturnValue({ status: "authenticated" } as ReturnType<typeof useAuth>);
  });

  it("calls taskService.getAll when auth status is authenticated", async () => {
    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    expect(taskService.getAll).toHaveBeenCalledOnce();
  });

  it("sets status to idle after tasks load", async () => {
    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    // After getAll resolves with [], status should be "idle"
    expect(capturedCtx!.status).toBe("idle");
  });

  it("does NOT call taskService.getAll when auth status is unauthenticated", async () => {
    // Override the useAuth mock for this test only — return unauthenticated
    const { useAuth } = await import("@/features/auth/hooks/useAuth");
    vi.mocked(useAuth).mockReturnValue({ status: "unauthenticated" } as ReturnType<typeof useAuth>);

    renderWithProvider();

    await act(async () => {
      await Promise.resolve();
    });

    expect(taskService.getAll).not.toHaveBeenCalled();

    // Restore default mock
    vi.mocked(useAuth).mockReturnValue({ status: "authenticated" } as ReturnType<typeof useAuth>);
  });
});

// ---------------------------------------------------------------------------
// TASK-01: TaskProvider createTask
// ---------------------------------------------------------------------------

describe("TaskProvider: createTask — TASK-01", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ status: "authenticated" } as ReturnType<typeof useAuth>);
    vi.mocked(taskService.getAll).mockResolvedValue([]);
    vi.mocked(taskService.create).mockResolvedValue(newTask);
  });

  it("dispatches TASK_CREATED and adds task to state after successful create", async () => {
    renderWithProvider();

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await capturedCtx!.createTask({
        taskName: "Test task",
        taskSort: 0,
        dueDt: null,
        isCompleted: false,
        isArchived: false,
        todoCategoryId: "00000000-0000-0000-0000-000000000000",
        todoPriorityId: "00000000-0000-0000-0000-000000000000",
        syncDt: new Date().toISOString(),
      });
    });

    expect(capturedCtx!.tasks).toContainEqual(newTask);
  });
});

// ---------------------------------------------------------------------------
// TASK-03: TaskProvider updateTask
// ---------------------------------------------------------------------------

describe("TaskProvider: updateTask — TASK-03", () => {
  const updatedTask = { ...newTask, taskName: "Updated task" };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ status: "authenticated" } as ReturnType<typeof useAuth>);
    vi.mocked(taskService.getAll).mockResolvedValue([newTask]);
    vi.mocked(taskService.update).mockResolvedValue(updatedTask);
  });

  it("dispatches TASK_UPDATED and replaces task in state after successful update", async () => {
    renderWithProvider();

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await capturedCtx!.updateTask(newTask.id, newTask, {
        taskName: "Updated task",
      });
    });

    const found = capturedCtx!.tasks.find((t) => t.id === newTask.id);
    expect(found?.taskName).toBe("Updated task");
  });
});

// ---------------------------------------------------------------------------
// TASK-04: TaskProvider deleteTask
// ---------------------------------------------------------------------------

describe("TaskProvider: deleteTask — TASK-04", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({ status: "authenticated" } as ReturnType<typeof useAuth>);
    vi.mocked(taskService.getAll).mockResolvedValue([newTask]);
    vi.mocked(taskService.delete).mockResolvedValue(undefined);
  });

  it("dispatches TASK_DELETED and removes task from state after successful delete", async () => {
    renderWithProvider();

    // Wait for initial load
    await act(async () => {
      await Promise.resolve();
    });

    await act(async () => {
      await capturedCtx!.deleteTask(newTask.id);
    });

    expect(capturedCtx!.tasks.find((t) => t.id === newTask.id)).toBeUndefined();
  });
});
