"use client";

import React from "react";
import { TodoTask } from "@/features/tasks/types/task";
import TaskForm from "@/components/tasks/TaskForm";

interface TaskModalProps {
  isOpen: boolean;
  task: TodoTask | null; // null = create mode, TodoTask = edit mode (D-02)
  onClose: () => void;
}

export default function TaskModal({ isOpen, task, onClose }: TaskModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2
          id="task-modal-title"
          className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100"
        >
          {task ? "Edit Task" : "New Task"}
        </h2>
        <TaskForm task={task} onClose={onClose} />
      </div>
    </div>
  );
}
