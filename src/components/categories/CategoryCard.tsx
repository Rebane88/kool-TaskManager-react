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
    <div className="rounded border p-3 shadow-sm flex items-center gap-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          {category.categoryName ?? "(unnamed)"}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(category)}
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(category.id)}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
