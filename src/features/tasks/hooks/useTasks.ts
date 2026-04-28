/**
 * useTasks hook.
 *
 * Exposes task state and actions from TaskProvider context.
 * Must be used within a <TaskProvider> tree.
 *
 * Returns:
 *   tasks          — current task array from reducer state
 *   status         — "idle" | "loading" | "error"
 *   error          — error message from last failed action, or null
 *   loadTasks()    — manually re-fetch all tasks
 *   createTask(req) — create a new task
 *   updateTask(id, task, changes) — update an existing task (full object spread)
 *   deleteTask(id) — delete a task by id
 *   toggleComplete(task) — flip task.isCompleted and save
 */

import { useTaskContext } from "@/features/tasks/state/TaskProvider";

export { type TaskContextValue as TaskContextShape } from "@/features/tasks/state/TaskProvider";

export function useTasks() {
  return useTaskContext();
}
