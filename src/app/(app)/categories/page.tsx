"use client";

import { useState, useMemo } from "react";
import { TodoCategory } from "@/features/categories/types/category";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { formatApiError } from "@/lib/api/apiError";
import CategoryCard from "@/components/categories/CategoryCard";
import CategoryModal from "@/components/categories/CategoryModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

const controlClass =
  "rounded border border-outline px-3 py-2 text-sm bg-surface text-ink";

export default function CategoriesPage() {
  const { categories, status, error, deleteCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TodoCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [catSearch, setCatSearch] = useState("");
  const [catSort, setCatSort] = useState<"name-asc" | "name-desc">("name-asc");

  const visibleCategories = useMemo(() => {
    let result = categories;
    if (catSearch.trim()) {
      const q = catSearch.trim().toLowerCase();
      result = result.filter((c) => c.categoryName?.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) =>
      catSort === "name-asc"
        ? (a.categoryName ?? "").localeCompare(b.categoryName ?? "")
        : (b.categoryName ?? "").localeCompare(a.categoryName ?? "")
    );
  }, [categories, catSearch, catSort]);

  function openCreate() {
    setEditingCategory(null);
    setModalOpen(true);
  }

  function openEdit(category: TodoCategory) {
    setEditingCategory(category);
    setModalOpen(true);
  }

  function openDelete(id: string) {
    setDeletingCategoryId(id);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingCategory(null);
  }

  function closeDelete() {
    setDeletingCategoryId(null);
  }

  async function handleConfirmDelete() {
    if (!deletingCategoryId) return;
    setDeleteError(null);
    try {
      await deleteCategory(deletingCategoryId);
      closeDelete();
    } catch (err) {
      setDeleteError(formatApiError(err, "Failed to delete category. Please try again."));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Categories</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text transition-colors"
        >
          + New Category
        </button>
      </div>

      {status === "loading" && (
        <p className="text-ink-muted">Loading categories…</p>
      )}
      {status === "error" && (
        <p className="text-danger">{error ?? "Failed to load categories. Try refreshing."}</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-danger mb-2">{deleteError}</p>
      )}

      {status !== "loading" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Search categories…"
              value={catSearch}
              onChange={(e) => setCatSearch(e.target.value)}
              className={`${controlClass} flex-1 min-w-[140px]`}
            />
            <select
              value={catSort}
              onChange={(e) => setCatSort(e.target.value as "name-asc" | "name-desc")}
              className={controlClass}
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            {categories.length === 0 && status === "idle" && (
              <p className="text-ink-muted text-sm">
                No categories yet. Create one to get started.
              </p>
            )}
            {categories.length > 0 && visibleCategories.length === 0 && (
              <p className="text-ink-muted text-sm">
                No matching categories.
              </p>
            )}
            {visibleCategories.map((cat) => (
              <CategoryCard key={cat.id} category={cat} onEdit={openEdit} onDelete={openDelete} />
            ))}
          </div>
        </>
      )}

      <CategoryModal isOpen={modalOpen} category={editingCategory} onClose={closeModal} />
      <ConfirmDeleteDialog
        taskId={deletingCategoryId}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
