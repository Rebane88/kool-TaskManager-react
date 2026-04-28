"use client";

import { useState } from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { useTasks } from "@/features/tasks/hooks/useTasks";
import TaskList from "@/components/tasks/TaskList";
import TaskModal from "@/components/tasks/TaskModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

export default function DashboardPage() {
  const { tasks, status, error, deleteTask } = useTasks();

  // Modal state (D-01: modal for create/edit, no route change)
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);

  // Delete confirmation state (D-07: confirm before delete)
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

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
    } catch {
      setDeleteError("Failed to delete task. Please try again.");
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Tasks</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Task
        </button>
      </div>

      {status === "loading" && (
        <p className="text-gray-500 dark:text-gray-400">Loading tasks\u2026</p>
      )}
      {status === "error" && (
        <p className="text-red-600 dark:text-red-400">{error ?? "Failed to load tasks. Try refreshing."}</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-2">{deleteError}</p>
      )}

      {status !== "loading" && (
        <TaskList tasks={tasks} onEdit={openEdit} onDelete={openDelete} />
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
