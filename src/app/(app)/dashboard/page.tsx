"use client";

import { useState } from "react";
import Link from "next/link";
import { formatApiError } from "@/lib/api/apiError";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import { useTaskFilters } from "@/features/tasks/hooks/useTaskFilters";
import TaskList from "@/components/tasks/TaskList";
import TaskFilterBar from "@/components/tasks/TaskFilterBar";
import TaskModal from "@/components/tasks/TaskModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

export default function DashboardPage() {
  const { tasks, status, error, deleteTask } = useTasks();
  const { categories, status: categoryStatus } = useCategories();
  const { priorities, status: priorityStatus } = usePriorities();

  const {
    visibleTasks,
    search, setSearch,
    categoryId, setCategoryId,
    priorityId, setPriorityId,
    statusFilter, setStatusFilter,
    sortBy, setSortBy,
  } = useTaskFilters(tasks, categories, priorities);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);

  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const showPrerequisiteBanner =
    (categories.length === 0 || priorities.length === 0) &&
    categoryStatus !== "loading" &&
    priorityStatus !== "loading";

  function openCreate() {
    setEditingTask(null);
    setModalOpen(true);
  }

  function openEdit(task: TodoTask) {
    setEditingTask(task);
    setModalOpen(true);
  }

  function openDelete(id: string) {
    setDeletingTaskId(id);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingTask(null);
  }

  function closeDelete() {
    setDeletingTaskId(null);
  }

  async function handleConfirmDelete() {
    if (!deletingTaskId) return;
    setDeleteError(null);
    try {
      await deleteTask(deletingTaskId);
      closeDelete();
    } catch (err) {
      setDeleteError(formatApiError(err, "Failed to delete task. Please try again."));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-ink">Tasks</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text transition-colors"
        >
          + New Task
        </button>
      </div>

      {showPrerequisiteBanner && (
        <div className="mb-4 p-3 rounded border border-amber-300 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-600 text-sm text-amber-800 dark:text-amber-200">
          To create tasks, first add a{" "}
          {categories.length === 0 && (
            <Link href="/categories" className="underline font-medium">category</Link>
          )}
          {categories.length === 0 && priorities.length === 0 && " and "}
          {priorities.length === 0 && (
            <Link href="/priorities" className="underline font-medium">priority</Link>
          )}
          .
        </div>
      )}

      <TaskFilterBar
        search={search} onSearch={setSearch}
        categoryId={categoryId} onCategory={setCategoryId} categories={categories}
        priorityId={priorityId} onPriority={setPriorityId} priorities={priorities}
        statusFilter={statusFilter} onStatus={setStatusFilter}
        sortBy={sortBy} onSort={setSortBy}
      />

      {status === "loading" && (
        <p className="text-ink-muted">Loading tasks…</p>
      )}
      {status === "error" && (
        <p className="text-danger">{error ?? "Failed to load tasks. Try refreshing."}</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-danger mb-2">{deleteError}</p>
      )}

      {status !== "loading" && tasks.length > 0 && visibleTasks.length === 0 && (
        <p className="text-ink-muted py-8 text-center">
          No tasks match your filters.
        </p>
      )}
      {status !== "loading" && (tasks.length === 0 || visibleTasks.length > 0) && (
        <TaskList tasks={visibleTasks} onEdit={openEdit} onDelete={openDelete} />
      )}

      <TaskModal isOpen={modalOpen} task={editingTask} onClose={closeModal} />

      <ConfirmDeleteDialog
        taskId={deletingTaskId}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
