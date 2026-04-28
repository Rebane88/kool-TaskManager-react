"use client";

/**
 * Task context provider.
 *
 * Manages task state using Context + Reducer (ARCH-01 / no prop drilling).
 * Exposes task actions and status to all consuming components via useTasks.
 *
 * Task status states:
 *   "idle"    — no operation in progress
 *   "loading" — fetch or mutation in progress
 *   "error"   — last operation failed
 *
 * Auth gating (Pitfall 4): initial task fetch is gated on authStatus === "authenticated".
 * TaskProvider reads useAuth().status and only fetches tasks after auth settles.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { taskService } from "@/features/tasks/services/taskService";
import { TodoTask, CreateTaskRequest, UpdateTaskRequest } from "@/features/tasks/types/task";
import { useAuth } from "@/features/auth/hooks/useAuth";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type TaskStatus = "idle" | "loading" | "error";

export interface TaskState {
  tasks: TodoTask[];
  status: TaskStatus;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  status: "idle",
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type TaskAction =
  | { type: "TASKS_LOADING" }
  | { type: "TASKS_LOADED"; payload: TodoTask[] }
  | { type: "TASKS_ERROR"; payload: string }
  | { type: "TASK_CREATED"; payload: TodoTask }
  | { type: "TASK_UPDATED"; payload: TodoTask }
  | { type: "TASK_DELETED"; payload: string }; // payload = task id

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "TASKS_LOADING":
      return { ...state, status: "loading", error: null };
    case "TASKS_LOADED":
      return { tasks: action.payload, status: "idle", error: null };
    case "TASKS_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "TASK_CREATED":
      return { ...state, tasks: [...state.tasks, action.payload] };
    case "TASK_UPDATED":
      return {
        ...state,
        tasks: state.tasks.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };
    case "TASK_DELETED":
      return { ...state, tasks: state.tasks.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface TaskContextValue extends TaskState {
  loadTasks: () => Promise<void>;
  createTask: (req: CreateTaskRequest) => Promise<void>;
  updateTask: (
    id: string,
    task: TodoTask,
    changes: Partial<Omit<UpdateTaskRequest, "id" | "createdDt" | "syncDt">>
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleComplete: (task: TodoTask) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function TaskProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);
  const { status: authStatus } = useAuth(); // Gate fetch on auth (Pitfall 4)

  // -------------------------------------------------------------------------
  // Initial task load — gated on authStatus (Pitfall 4 guard)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    dispatch({ type: "TASKS_LOADING" });
    taskService
      .getAll()
      .then((tasks) => {
        dispatch({ type: "TASKS_LOADED", payload: tasks });
      })
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "Failed to load tasks";
        dispatch({ type: "TASKS_ERROR", payload: message });
      });
  }, [authStatus]);

  // -------------------------------------------------------------------------
  // Task actions
  // -------------------------------------------------------------------------

  const loadTasks = useCallback(async (): Promise<void> => {
    dispatch({ type: "TASKS_LOADING" });
    try {
      const tasks = await taskService.getAll();
      dispatch({ type: "TASKS_LOADED", payload: tasks });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load tasks";
      dispatch({ type: "TASKS_ERROR", payload: message });
    }
  }, []);

  const createTask = useCallback(async (req: CreateTaskRequest): Promise<void> => {
    try {
      const task = await taskService.create(req);
      dispatch({ type: "TASK_CREATED", payload: task });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create task";
      dispatch({ type: "TASKS_ERROR", payload: message });
      throw err; // re-throw so UI can handle errors
    }
  }, []);

  const updateTask = useCallback(
    async (
      id: string,
      task: TodoTask,
      changes: Partial<Omit<UpdateTaskRequest, "id" | "createdDt" | "syncDt">>
    ): Promise<void> => {
      try {
        const updated = await taskService.update(id, task, changes);
        dispatch({ type: "TASK_UPDATED", payload: updated });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to update task";
        dispatch({ type: "TASKS_ERROR", payload: message });
        throw err; // re-throw so UI can handle errors
      }
    },
    []
  );

  const deleteTask = useCallback(async (id: string): Promise<void> => {
    try {
      await taskService.delete(id);
      dispatch({ type: "TASK_DELETED", payload: id });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete task";
      dispatch({ type: "TASKS_ERROR", payload: message });
      throw err; // re-throw so UI can handle errors
    }
  }, []);

  const toggleComplete = useCallback(async (task: TodoTask): Promise<void> => {
    try {
      const updated = await taskService.update(task.id, task, {
        isCompleted: !task.isCompleted,
      });
      dispatch({ type: "TASK_UPDATED", payload: updated });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to toggle task";
      dispatch({ type: "TASKS_ERROR", payload: message });
      throw err; // re-throw so UI can handle errors
    }
  }, []);

  const value: TaskContextValue = {
    ...state,
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleComplete,
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

// ---------------------------------------------------------------------------
// Context accessor (used by useTasks hook)
// ---------------------------------------------------------------------------

export function useTaskContext(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error("useTaskContext must be used within a TaskProvider");
  }
  return ctx;
}
