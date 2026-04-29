"use client";

import React, { useState } from "react";
import { TodoCategory } from "@/features/categories/types/category";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { formatApiError } from "@/lib/api/apiError";

interface CategoryFormProps {
  category: TodoCategory | null;
  onClose: () => void;
}

export default function CategoryForm({ category, onClose }: CategoryFormProps) {
  const { createCategory, updateCategory } = useCategories();
  const [categoryName, setCategoryName] = useState(category?.categoryName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = categoryName.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }
    if (trimmedName.length > 128) {
      setError("Category name must be 128 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      if (category) {
        await updateCategory(category.id, { ...category, categoryName: trimmedName });
      } else {
        await createCategory({ categoryName: trimmedName, categorySort: 0, tag: null });
      }
      onClose();
    } catch (err) {
      setError(formatApiError(err, "Failed to save category"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="category-name"
          className="block text-sm font-medium text-ink-muted mb-1"
        >
          Category name <span aria-hidden="true">*</span>
        </label>
        <input
          id="category-name"
          type="text"
          value={categoryName}
          maxLength={128}
          onChange={(e) => setCategoryName(e.target.value)}
          required
          autoFocus
          placeholder="e.g. Work, Personal"
          className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving…" : category ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
