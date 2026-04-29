"use client";

import React from "react";
import { TodoCategory } from "@/features/categories/types/category";
import { TodoPriority } from "@/features/priorities/types/priority";
import { SortOption, StatusFilter } from "@/features/tasks/hooks/useTaskFilters";

const controlClass =
  "rounded border border-outline px-3 py-2 text-sm bg-surface text-ink";

interface TaskFilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  categoryId: string;
  onCategory: (v: string) => void;
  categories: TodoCategory[];
  priorityId: string;
  onPriority: (v: string) => void;
  priorities: TodoPriority[];
  statusFilter: StatusFilter;
  onStatus: (v: StatusFilter) => void;
  sortBy: SortOption;
  onSort: (v: SortOption) => void;
}

export default function TaskFilterBar({
  search,
  onSearch,
  categoryId,
  onCategory,
  categories,
  priorityId,
  onPriority,
  priorities,
  statusFilter,
  onStatus,
  sortBy,
  onSort,
}: TaskFilterBarProps) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      <input
        type="text"
        placeholder="Search tasks…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className={`${controlClass} flex-1 min-w-[140px]`}
      />
      <select
        value={categoryId}
        onChange={(e) => onCategory(e.target.value)}
        className={controlClass}
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.categoryName}
          </option>
        ))}
      </select>
      <select
        value={priorityId}
        onChange={(e) => onPriority(e.target.value)}
        className={controlClass}
      >
        <option value="">All priorities</option>
        {priorities.map((p) => (
          <option key={p.id} value={p.id}>
            {p.priorityName}
          </option>
        ))}
      </select>
      <select
        value={statusFilter}
        onChange={(e) => onStatus(e.target.value as StatusFilter)}
        className={controlClass}
      >
        <option value="all">All statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
      </select>
      <select
        value={sortBy}
        onChange={(e) => onSort(e.target.value as SortOption)}
        className={controlClass}
      >
        <option value="dueDate-asc">Due date ↑</option>
        <option value="dueDate-desc">Due date ↓</option>
        <option value="name-asc">Name A–Z</option>
        <option value="name-desc">Name Z–A</option>
        <option value="created-desc">Newest first</option>
        <option value="created-asc">Oldest first</option>
      </select>
    </div>
  );
}
