/**
 * useCategories hook.
 *
 * Exposes category state and actions from CategoryProvider context.
 * Must be used within a <CategoryProvider> tree.
 *
 * Returns:
 *   categories        — current category array from reducer state
 *   status            — "idle" | "loading" | "error"
 *   error             — error message from last failed action, or null
 *   loadCategories()  — manually re-fetch all categories
 *   createCategory(data) — create a new category
 *   updateCategory(id, updatedCategory) — update an existing category
 *   deleteCategory(id) — delete a category by id
 */

import { useCategoryContext } from "@/features/categories/state/CategoryProvider";

export { type CategoryContextValue as CategoryContextShape } from "@/features/categories/state/CategoryProvider";

export function useCategories() {
  return useCategoryContext();
}
