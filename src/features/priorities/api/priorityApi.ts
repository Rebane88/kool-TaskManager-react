/**
 * Priority API endpoint wrappers.
 * All priority HTTP requests route exclusively through apiClient (ARCH-02).
 * Access token injected per-request via getAccessToken() (AUTH-05).
 *
 * ASYMMETRIC RETURNS vs taskApi/categoryApi:
 *   POST /api/v1/TodoPriorities        — returns 200 (not 201 like category POST)
 *   PUT  /api/v1/TodoPriorities/{id}   — returns 200 with NO body (use apiClient<unknown>)
 *   DELETE /api/v1/TodoPriorities/{id} — returns 200 with NO body (use apiClient<unknown>)
 *
 * PRIO-01: create  PRIO-02: getAll  PRIO-03: update  PRIO-04: delete
 */

import { apiClient } from "@/lib/api/apiClient";
import { getAccessToken } from "@/features/auth/storage/tokenMemoryStore";
import {
  TodoPriority,
  CreatePriorityRequest,
  UpdatePriorityRequest,
} from "@/features/priorities/types/priority";

const API_VERSION = "1";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://robreb-express.proxy.itcollege.ee";

function endpoint(path: string): string {
  return `${BASE_URL}/api/v${API_VERSION}/${path}`;
}

export const priorityApi = {
  async getAll(): Promise<TodoPriority[]> {
    return apiClient<TodoPriority[]>({
      method: "GET",
      url: endpoint("TodoPriorities"),
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async create(req: CreatePriorityRequest): Promise<TodoPriority> {
    // POST returns 200 (not 201) — body is the created TodoPriority
    return apiClient<TodoPriority>({
      method: "POST",
      url: endpoint("TodoPriorities"),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async update(id: string, req: UpdatePriorityRequest): Promise<void> {
    // PUT returns 200 with NO body — use apiClient<unknown> and discard result (Pitfall 3)
    await apiClient<unknown>({
      method: "PUT",
      url: endpoint(`TodoPriorities/${id}`),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async delete(id: string): Promise<void> {
    // DELETE returns 200 with NO body — use apiClient<unknown> and discard result (Pitfall 3)
    await apiClient<unknown>({
      method: "DELETE",
      url: endpoint(`TodoPriorities/${id}`),
      accessToken: getAccessToken() ?? undefined,
    });
  },
};
