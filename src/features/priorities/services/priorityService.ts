/**
 * Priority service — orchestrates priority operations with correct API contract enforcement.
 *
 * CRITICAL: priorityService.update returns the composed UpdatePriorityRequest
 * as the updated TodoPriority. The API PUT returns no body (200 no content).
 * The provider dispatches PRIORITY_UPDATED using this composed object — optimistic update.
 *
 * Error handling: errors propagate as ApiError from priorityApi — priorityService does not
 * swallow or transform errors. Callers (PriorityProvider action callbacks) catch and dispatch.
 *
 * PRIO-01: create  PRIO-02: getAll  PRIO-03: update  PRIO-04: delete
 */

import { priorityApi } from "@/features/priorities/api/priorityApi";
import {
  TodoPriority,
  CreatePriorityRequest,
  UpdatePriorityRequest,
} from "@/features/priorities/types/priority";

export const priorityService = {
  async getAll(): Promise<TodoPriority[]> {
    return priorityApi.getAll();
  },

  async create(req: CreatePriorityRequest): Promise<TodoPriority> {
    return priorityApi.create(req);
  },

  /**
   * Update a priority.
   *
   * PUT requires the FULL object (Pitfall 1). The existing priority is spread as the base,
   * then only the provided changes are overridden. syncDt is always refreshed to now.
   *
   * CRITICAL: API returns no body on PUT (Pitfall 3) — this method returns the composed
   * request payload as the updated entity for optimistic state dispatch in PriorityProvider.
   *
   * @param id       - Priority UUID
   * @param priority - Existing priority (provides all fields not being changed)
   * @param changes  - Only the fields being changed (e.g. { priorityName })
   */
  async update(
    id: string,
    priority: TodoPriority,
    changes: Partial<Omit<UpdatePriorityRequest, "id" | "syncDt">>
  ): Promise<TodoPriority> {
    const req: UpdatePriorityRequest = {
      id: priority.id,
      appUserId: priority.appUserId,        // preserve server-assigned user ID
      priorityName: priority.priorityName ?? "",
      prioritySort: priority.prioritySort,
      tag: priority.tag,
      syncDt: new Date().toISOString(),     // always refresh syncDt on edit
      ...changes,
    };
    await priorityApi.update(id, req);
    // API returns no body — return composed request as the updated entity (optimistic update)
    return req as TodoPriority;
  },

  async delete(id: string): Promise<void> {
    return priorityApi.delete(id);
  },
};
