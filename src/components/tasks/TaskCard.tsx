"use client";

import React from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";

interface TaskCardProps {
  task: TodoTask;
  onEdit: (task: TodoTask) => void;
  onDelete: (id: string) => void;
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

export default function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const { toggleComplete } = useTasks();

  return (
    <div
      className={[
        "rounded border p-3 shadow-sm flex items-start gap-3",
        "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
        task.isCompleted ? "opacity-60" : "",
      ].join(" ")}
    >
      <input
        type="checkbox"
        checked={task.isCompleted}
        onChange={() => void toggleComplete(task)}
        aria-label={task.isCompleted ? "Mark incomplete" : "Mark complete"}
        className="mt-1 h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
      />
      <div className="flex-1 min-w-0">
        <span
          className={[
            "block text-sm font-medium truncate",
            task.isCompleted ? "line-through text-gray-400" : "text-gray-900 dark:text-gray-100",
          ].join(" ")}
        >
          {task.taskName}
        </span>
        {task.dueDt && (
          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {formatDueDate(task.dueDt)}
          </span>
        )}
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onEdit(task)}
          className="rounded px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => onDelete(task.id)}
          className="rounded px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
