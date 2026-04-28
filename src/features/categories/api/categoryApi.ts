/**
 * Category API endpoint wrappers.
 * All category HTTP requests route exclusively through apiClient (ARCH-02).
 * Access token injected per-request via getAccessToken() (AUTH-05).
 *
 * Endpoints:
 *   GET    /api/v1/TodoCategories        — fetch all categories for authenticated user
 *   POST   /api/v1/TodoCategories        — create; returns 201 with body
 *   PUT    /api/v1/TodoCategories/{id}   — full replace; returns 200 with body
 *   DELETE /api/v1/TodoCategories/{id}   — delete; returns 204 no body (use apiClient<unknown>)
 */

import { apiClient } from "@/lib/api/apiClient";
import { getAccessToken } from "@/features/auth/storage/tokenMemoryStore";
import {
  TodoCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/features/categories/types/category";

const API_VERSION = "1";
const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://taltech.akaver.com";

function endpoint(path: string): string {
  return `${BASE_URL}/api/v${API_VERSION}/${path}`;
}

export const categoryApi = {
  async getAll(): Promise<TodoCategory[]> {
    return apiClient<TodoCategory[]>({
      method: "GET",
      url: endpoint("TodoCategories"),
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async create(req: CreateCategoryRequest): Promise<TodoCategory> {
    return apiClient<TodoCategory>({
      method: "POST",
      url: endpoint("TodoCategories"),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async update(id: string, req: UpdateCategoryRequest): Promise<TodoCategory> {
    return apiClient<TodoCategory>({
      method: "PUT",
      url: endpoint(`TodoCategories/${id}`),
      body: req,
      accessToken: getAccessToken() ?? undefined,
    });
  },

  async delete(id: string): Promise<void> {
    // DELETE returns 204 No Content — use apiClient<unknown> and discard result (Pitfall 3)
    await apiClient<unknown>({
      method: "DELETE",
      url: endpoint(`TodoCategories/${id}`),
      accessToken: getAccessToken() ?? undefined,
    });
  },
};
