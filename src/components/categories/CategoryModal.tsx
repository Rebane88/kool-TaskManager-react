"use client";

import React from "react";
import { TodoCategory } from "@/features/categories/types/category";
import CategoryForm from "@/components/categories/CategoryForm";

interface CategoryModalProps {
  isOpen: boolean;
  category: TodoCategory | null;
  onClose: () => void;
}

export default function CategoryModal({ isOpen, category, onClose }: CategoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="category-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 id="category-modal-title" className="text-base font-semibold mb-4">
          {category ? "Edit Category" : "New Category"}
        </h2>
        <CategoryForm category={category} onClose={onClose} />
      </div>
    </div>
  );
}
