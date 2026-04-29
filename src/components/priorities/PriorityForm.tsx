"use client";

import React, { useState } from "react";
import { TodoPriority } from "@/features/priorities/types/priority";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import { formatApiError } from "@/lib/api/apiError";

interface PriorityFormProps {
  priority: TodoPriority | null;
  onClose: () => void;
}

export default function PriorityForm({ priority, onClose }: PriorityFormProps) {
  const { createPriority, updatePriority } = usePriorities();
  const [priorityName, setPriorityName] = useState(priority?.priorityName ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = priorityName.trim();
    if (!trimmedName) {
      setError("Priority name is required.");
      return;
    }
    if (trimmedName.length > 128) {
      setError("Priority name must be 128 characters or fewer.");
      return;
    }

    setSubmitting(true);
    try {
      if (priority) {
        await updatePriority(priority.id, { ...priority, priorityName: trimmedName });
      } else {
        await createPriority({ priorityName: trimmedName, prioritySort: 0, tag: null });
      }
      onClose();
    } catch (err) {
      setError(formatApiError(err, "Failed to save priority"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="priority-name"
          className="block text-sm font-medium text-ink-muted mb-1"
        >
          Priority name <span aria-hidden="true">*</span>
        </label>
        <input
          id="priority-name"
          type="text"
          value={priorityName}
          maxLength={128}
          onChange={(e) => setPriorityName(e.target.value)}
          required
          autoFocus
          placeholder="e.g. High, Medium, Low"
          className="w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium text-ink-muted hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving…" : priority ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
