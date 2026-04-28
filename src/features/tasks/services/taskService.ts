/**
 * Task service — orchestrates task operations with correct API contract enforcement.
 *
 * Key responsibility: taskService.update builds the full UpdateTaskRequest by spreading
 * the existing task before applying changes. This is required because PUT replaces the
 * entire resource — sending only changed fields causes data loss (Pitfall 1).
 *
 * Error handling: errors propagate as ApiError from taskApi — taskService does not
 * swallow or transform errors. Callers (TaskProvider action callbacks) catch and dispatch.
 *
 * TASK-01: create
 * TASK-02: getAll
 * TASK-03: update
 * TASK-04: delete
 * TASK-05: toggleComplete (via update with isCompleted flipped)
 */

import { taskApi } from "@/features/tasks/api/taskApi";
import { TodoTask, CreateTaskRequest, UpdateTaskRequest } from "@/features/tasks/types/task";

export const taskService = {
  async getAll(): Promise<TodoTask[]> {
    return taskApi.getAll();
  },

  async create(req: CreateTaskRequest): Promise<TodoTask> {
    return taskApi.create(req);
  },

  /**
   * Update a task.
   *
   * PUT requires the FULL object (Pitfall 1). The existing task is spread as the base,
   * then only the provided changes are overridden. syncDt is always refreshed to now.
   *
   * @param id     - Task UUID
   * @param task   - Existing task (provides all fields not being changed)
   * @param changes - Only the fields being changed (e.g. { taskName, dueDt } or { isCompleted })
   */
  async update(
    id: string,
    task: TodoTask,
    changes: Partial<Omit<UpdateTaskRequest, "id" | "createdDt" | "syncDt">>
  ): Promise<TodoTask> {
    const req: UpdateTaskRequest = {
      id: task.id,
      taskName: task.taskName ?? "",
      taskSort: task.taskSort,
      createdDt: task.createdDt,
      dueDt: task.dueDt,
      isCompleted: task.isCompleted,
      isArchived: task.isArchived,
      todoCategoryId: task.todoCategoryId,
      todoPriorityId: task.todoPriorityId,
      syncDt: new Date().toISOString(),
      ...changes,
    };
    return taskApi.update(id, req);
  },

  async delete(id: string): Promise<void> {
    return taskApi.delete(id);
  },
};
