/**
 * Task API endpoint wrappers.
 *
 * All task HTTP requests route exclusively through apiClient (ARCH-02).
 * Access token is injected per-request via getAccessToken() (AUTH-05).
 *
 * Endpoints:
 *   GET    /api/v1/TodoTasks        — fetch all tasks for authenticated user
 *   POST   /api/v1/TodoTasks        — create a new task
 *   PUT    /api/v1/TodoTasks/{id}   — full replace (not patch) of an existing task
 *   DELETE /api/v1/TodoTasks/{id}   — delete; returns HTTP 200 with no body (Pitfall 3)
 */

import { apiClient } from "@/lib/api/apiClient";
import { getAccessToken } from "@/features/auth/storage/tokenMemoryStore";
import { TodoTask, CreateTaskRequest, UpdateTaskRequest } from "@/features/tasks/types/task";

const API_VERSION = "1";
const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://robreb-express.proxy.itcollege.ee";

function endpoint(path: string): string {
  return `${BASE_URL}/api/v${API_VERSION}/${path}`;
}

export const taskApi = {
  async getAll(): Promise<TodoTask[]> {
    return apiClient<TodoTask[]>({
      method: "GET",
      url: endpoint("TodoTasks"),
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async create(req: CreateTaskRequest): Promise<TodoTask> {
    return apiClient<TodoTask>({
      method: "POST",
      url: endpoint("TodoTasks"),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async update(id: string, req: UpdateTaskRequest): Promise<TodoTask> {
    return apiClient<TodoTask>({
      method: "PUT",
      url: endpoint(`TodoTasks/${id}`),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async delete(id: string): Promise<void> {
    // DELETE returns HTTP 200 with no body.
    // Use apiClient<unknown> and discard the return — avoids JSON parse failure (Pitfall 3).
    await apiClient<unknown>({
      method: "DELETE",
      url: endpoint(`TodoTasks/${id}`),
      accessToken: getAccessToken() ?? undefined,
    });
  },
};
