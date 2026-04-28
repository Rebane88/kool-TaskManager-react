/**
 * Category service — orchestrates category operations with correct API contract enforcement.
 *
 * categoryService.update builds the full UpdateCategoryRequest by spreading
 * the existing category before applying changes (PUT replaces entire resource — Pitfall 1).
 * syncDt is always refreshed to now on update.
 *
 * CATE-01: create   CATE-02: getAll   CATE-03: update   CATE-04: delete
 */

import { categoryApi } from "@/features/categories/api/categoryApi";
import {
  TodoCategory,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/features/categories/types/category";

export const categoryService = {
  async getAll(): Promise<TodoCategory[]> {
    return categoryApi.getAll();
  },

  async create(req: CreateCategoryRequest): Promise<TodoCategory> {
    return categoryApi.create(req);
  },

  /**
   * Update a category.
   *
   * PUT requires the FULL object (Pitfall 1). The existing category is spread as the base,
   * then only the provided changes are overridden. syncDt is always refreshed to now.
   *
   * @param id       - Category UUID
   * @param category - Existing category (provides all fields not being changed)
   * @param changes  - Only the fields being changed (e.g. { categoryName })
   */
  async update(
    id: string,
    category: TodoCategory,
    changes: Partial<Omit<UpdateCategoryRequest, "id" | "syncDt">>
  ): Promise<TodoCategory> {
    const req: UpdateCategoryRequest = {
      id: category.id,
      categoryName: category.categoryName ?? "",
      categorySort: category.categorySort,
      tag: category.tag,
      syncDt: new Date().toISOString(),
      ...changes,
    };
    return categoryApi.update(id, req);
  },

  async delete(id: string): Promise<void> {
    return categoryApi.delete(id);
  },
};
