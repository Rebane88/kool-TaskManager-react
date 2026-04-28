"use client";

import React, { useState } from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { EMPTY_GUID } from "@/lib/constants";
import { formatApiError } from "@/lib/api/apiError";

interface TaskFormProps {
  task?: TodoTask | null; // undefined/null = create mode (empty form), TodoTask = edit mode (pre-filled)
  onClose: () => void;
}

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const [taskName, setTaskName] = useState(task?.taskName ?? "");
  // dueDt in the API is ISO 8601 datetime, but the date input uses YYYY-MM-DD.
  // Extract just the date portion for the input value; send full ISO string on submit.
  const [dueDt, setDueDt] = useState(
    task?.dueDt ? task.dueDt.substring(0, 10) : ""
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedName = taskName.trim();
    if (!trimmedName) {
      setError("Task name is required.");
      return;
    }
    if (trimmedName.length > 128) {
      setError("Task name must be 128 characters or fewer.");
      return;
    }

    // Convert date-only string back to ISO 8601 for the API; null if empty
    const dueDtIso = dueDt ? `${dueDt}T00:00:00.000Z` : null;

    setSubmitting(true);
    try {
      if (task) {
        // Edit mode: send only the changed fields (taskService.update spreads the rest)
        await updateTask(task.id, task, {
          taskName: trimmedName,
          dueDt: dueDtIso,
        });
      } else {
        // Create mode: send full CreateTaskRequest with all required defaults
        await createTask({
          taskName: trimmedName,
          taskSort: 0,
          dueDt: dueDtIso,
          isCompleted: false,
          isArchived: false,
          todoCategoryId: EMPTY_GUID,
          todoPriorityId: EMPTY_GUID,
          syncDt: new Date().toISOString(),
        });
      }
      onClose();
    } catch (err) {
      setError(formatApiError(err, "Failed to save task"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
      <div>
        <label
          htmlFor="task-name"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Task name <span aria-hidden="true">*</span>
        </label>
        <input
          id="task-name"
          type="text"
          value={taskName}
          maxLength={128}
          onChange={(e) => setTaskName(e.target.value)}
          required
          autoFocus
          placeholder="What needs to be done?"
          className="w-full rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label
          htmlFor="task-due-dt"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Due date <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          id="task-due-dt"
          type="date"
          value={dueDt}
          onChange={(e) => setDueDt(e.target.value)}
          className="rounded border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      <div className="flex gap-3 justify-end pt-2">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? "Saving\u2026" : task ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
