"use client";

import { useState } from "react";
import { TodoPriority } from "@/features/priorities/types/priority";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import { formatApiError } from "@/lib/api/apiError";
import PriorityCard from "@/components/priorities/PriorityCard";
import PriorityModal from "@/components/priorities/PriorityModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

export default function PrioritiesPage() {
  const { priorities, status, error, deletePriority } = usePriorities();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<TodoPriority | null>(null);
  const [deletingPriorityId, setDeletingPriorityId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function openCreate() {
    setEditingPriority(null);
    setModalOpen(true);
  }

  function openEdit(priority: TodoPriority) {
    setEditingPriority(priority);
    setModalOpen(true);
  }

  function openDelete(id: string) {
    setDeletingPriorityId(id);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingPriority(null);
  }

  function closeDelete() {
    setDeletingPriorityId(null);
  }

  async function handleConfirmDelete() {
    if (!deletingPriorityId) return;
    setDeleteError(null);
    try {
      await deletePriority(deletingPriorityId);
      closeDelete();
    } catch (err) {
      setDeleteError(formatApiError(err, "Failed to delete priority. Please try again."));
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Priorities</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          + New Priority
        </button>
      </div>

      {status === "loading" && (
        <p className="text-gray-500 dark:text-gray-400">Loading priorities\u2026</p>
      )}
      {status === "error" && (
        <p className="text-red-600 dark:text-red-400">{error ?? "Failed to load priorities. Try refreshing."}</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-red-600 dark:text-red-400 mb-2">{deleteError}</p>
      )}

      {status !== "loading" && (
        <div className="flex flex-col gap-2">
          {priorities.length === 0 && status === "idle" && (
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              No priorities yet. Create one to get started.
            </p>
          )}
          {priorities.map((p) => (
            <PriorityCard key={p.id} priority={p} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      )}

      <PriorityModal isOpen={modalOpen} priority={editingPriority} onClose={closeModal} />
      <ConfirmDeleteDialog
        taskId={deletingPriorityId}
        onConfirm={handleConfirmDelete}
        onCancel={closeDelete}
      />
    </div>
  );
}
