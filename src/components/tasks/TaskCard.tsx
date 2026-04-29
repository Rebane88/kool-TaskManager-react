"use client";

import React from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";

interface TaskCardProps {
  task: TodoTask;
  onEdit: (task: TodoTask) => void;
  onDelete: (id: string) => void;
  categoryName?: string;
  priorityName?: string;
}

function formatDueDate(dueDt: string): string {
  const date = new Date(dueDt);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";

  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date);
}

export default function TaskCard({ task, onEdit, onDelete, categoryName, priorityName }: TaskCardProps) {
  const { toggleComplete } = useTasks();

  return (
    <div
      className={[
        "card-surface p-3 flex items-start gap-3",
        task.isCompleted ? "opacity-60" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => void toggleComplete(task)}
        aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
        className="mt-1 h-4 w-4 rounded border-outline accent-action cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <span
          className={[
            "block text-sm font-medium truncate",
            task.isCompleted ? "line-through text-ink-faint" : "text-ink",
          ].join(" ")}
        >
          {task.taskName}
        </span>
        {task.dueDt && (
          <span className="block text-xs text-ink-muted mt-0.5">
            {formatDueDate(task.dueDt)}
          </span>
        )}
        {(priorityName || categoryName) && (
          <div className="flex gap-1 mt-1.5">
            {priorityName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium">
                {priorityName}
              </span>
            )}
            {categoryName && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                {categoryName}
              </span>
            )}
          </div>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded px-2 py-1 text-xs font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-ink transition-colors"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded px-2 py-1 text-xs font-medium text-danger hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
