"use client";

import React from "react";
import { TodoCategory } from "@/features/categories/types/category";

interface CategoryCardProps {
  category: TodoCategory;
  onEdit: (category: TodoCategory) => void;
  onDelete: (id: string) => void;
}

export default function CategoryCard({ category, onEdit, onDelete }: CategoryCardProps) {
  return (
    <div className="card-surface p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-ink truncate">
          {category.categoryName ?? "(unnamed)"}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded px-2 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-ink transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(category.id)}
          className="rounded px-2 py-1 text-xs font-medium text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
