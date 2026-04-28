"use client";

import React from "react";

interface ConfirmDeleteDialogProps {
  taskId: string | null;     // null = hidden; non-null = visible with this taskId
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export default function ConfirmDeleteDialog({
  taskId,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  if (!taskId) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-sm mx-4">
        <h2 id="confirm-delete-title" className="text-base font-semibold mb-2">
          Delete Task
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Delete this task? This can&apos;t be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="rounded px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
