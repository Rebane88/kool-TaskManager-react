"use client";

import React from "react";

interface ConfirmDeleteDialogProps {
  taskId: string | null;
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
      <div className="modal-surface p-6 w-full max-w-sm mx-4">
        <h2 id="confirm-delete-title" className="text-base font-semibold mb-2 text-ink">
          Delete
        </h2>
        <p className="text-sm text-ink-muted mb-6">
          This can&apos;t be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-4 py-2 text-sm font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            className="rounded px-4 py-2 text-sm font-medium text-white bg-danger hover:bg-danger-hover transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
