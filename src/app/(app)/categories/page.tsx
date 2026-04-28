"use client";

import { useState } from "react";
import { TodoCategory } from "@/features/categories/types/category";
import { useCategories } from "@/features/categories/hooks/useCategories";
import CategoryCard from "@/components/categories/CategoryCard";
import CategoryModal from "@/components/categories/CategoryModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

export default function CategoriesPage() {
  const { categories, status, deleteCategory } = useCategories();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TodoCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(null);

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
    if (deletingCategoryId) {
      await deleteCategory(deletingCategoryId);
      closeDelete();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Categories</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Category
        </button>
      </div>

      {status === "loading" && (
        <p className="text-gray-500 dark:text-gray-400">Loading categories\u2026</p>
      )}
      {status === "error" && (
        <p className="text-red-600 dark:text-red-400">Failed to load categories. Try refreshing.</p>
      )}

      {status !== "loading" && (
        <div className="flex flex-col gap-2">
          {categories.length === 0 && status === "idle" && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No categories yet. Create one to get started.
            </p>
          )}
          {categories.map((cat) => (
            <CategoryCard key={cat.id} category={cat} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
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
