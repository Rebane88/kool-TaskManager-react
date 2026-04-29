"use client";

import React, { useState } from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { formatApiError } from "@/lib/api/apiError";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";

interface TaskFormProps {
  task?: TodoTask | null;
  onClose: () => void;
}

const inputClass =
  "w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink disabled:opacity-50";

const selectClass =
  "w-full rounded border border-outline px-3 py-2 text-sm bg-surface text-ink disabled:opacity-50";

export default function TaskForm({ task, onClose }: TaskFormProps) {
  const { createTask, updateTask } = useTasks();
  const { categories } = useCategories();
  const { priorities } = usePriorities();
  const [taskName, setTaskName] = useState(task?.taskName ?? "");
  const [dueDt, setDueDt] = useState(
    task?.dueDt ? task.dueDt.substring(0, 10) : ""
  );
  const [categoryId, setCategoryId] = useState(task?.todoCategoryId ?? "");
  const [priorityId, setPriorityId] = useState(task?.todoPriorityId ?? "");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const missingPrerequisites = categories.length === 0 || priorities.length === 0;

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

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }
    if (!priorityId) {
      setError("Please select a priority.");
      return;
    }

    const dueDtIso = dueDt ? `${dueDt}T00:00:00.000Z` : null;

    setSubmitting(true);
    try {
      if (task) {
        await updateTask(task.id, task, {
          taskName: trimmedName,
          dueDt: dueDtIso,
          todoCategoryId: categoryId,
          todoPriorityId: priorityId,
        });
      } else {
        await createTask({
          taskName: trimmedName,
          taskSort: 0,
          dueDt: dueDtIso,
          isCompleted: false,
          isArchived: false,
          todoCategoryId: categoryId,
          todoPriorityId: priorityId,
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
          className="block text-sm font-medium text-ink-muted mb-1"
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
          className={inputClass}
        />
      </div>
      <div>
        <label
          htmlFor="task-due-dt"
          className="block text-sm font-medium text-ink-muted mb-1"
        >
          Due date <span className="text-ink-faint font-normal">(optional)</span>
        </label>
        <input
          id="task-due-dt"
          type="date"
          value={dueDt}
          onChange={(e) => setDueDt(e.target.value)}
          className="rounded border border-outline px-3 py-2 text-sm bg-surface text-ink"
        />
      </div>

      <div>
        <label
          htmlFor="task-category"
          className="block text-sm font-medium text-ink-muted mb-1"
        >
          Category <span aria-hidden="true">*</span>
        </label>
        <select
          id="task-category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          disabled={categories.length === 0}
          className={selectClass}
        >
          <option value="">Select a category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.categoryName}</option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="task-priority"
          className="block text-sm font-medium text-ink-muted mb-1"
        >
          Priority <span aria-hidden="true">*</span>
        </label>
        <select
          id="task-priority"
          value={priorityId}
          onChange={(e) => setPriorityId(e.target.value)}
          required
          disabled={priorities.length === 0}
          className={selectClass}
        >
          <option value="">Select a priority</option>
          {priorities.map((p) => (
            <option key={p.id} value={p.id}>{p.priorityName}</option>
          ))}
        </select>
      </div>

      {missingPrerequisites && (
        <p className="text-sm text-amber-600 dark:text-amber-400">
          Please create a category and priority before adding tasks.
        </p>
      )}

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
          disabled={submitting || missingPrerequisites}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text disabled:opacity-50 transition-colors"
        >
          {submitting ? "Saving…" : task ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}
