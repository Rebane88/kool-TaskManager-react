"use client";

import React from "react";
import { TodoPriority } from "@/features/priorities/types/priority";

interface PriorityCardProps {
  priority: TodoPriority;
  onEdit: (priority: TodoPriority) => void;
  onDelete: (id: string) => void;
}

export default function PriorityCard({ priority, onEdit, onDelete }: PriorityCardProps) {
  return (
    <div className="card-surface p-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-ink truncate">
          {priority.priorityName ?? "(unnamed)"}
        </span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(priority)}
          className="rounded px-2 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-ink transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(priority.id)}
          className="rounded px-2 py-1 text-xs font-medium text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
