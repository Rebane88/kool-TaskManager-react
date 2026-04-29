"use client";

import { useState, useMemo } from "react";
import { TodoPriority } from "@/features/priorities/types/priority";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";
import { formatApiError } from "@/lib/api/apiError";
import PriorityCard from "@/components/priorities/PriorityCard";
import PriorityModal from "@/components/priorities/PriorityModal";
import ConfirmDeleteDialog from "@/components/tasks/ConfirmDeleteDialog";

const controlClass =
  "rounded border border-outline px-3 py-2 text-sm bg-surface text-ink";

export default function PrioritiesPage() {
  const { priorities, status, error, deletePriority } = usePriorities();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPriority, setEditingPriority] = useState<TodoPriority | null>(null);
  const [deletingPriorityId, setDeletingPriorityId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [prioSearch, setPrioSearch] = useState("");
  const [prioSort, setPrioSort] = useState<"name-asc" | "name-desc">("name-asc");

  const visiblePriorities = useMemo(() => {
    let result = priorities;
    if (prioSearch.trim()) {
      const q = prioSearch.trim().toLowerCase();
      result = result.filter((p) => p.priorityName?.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) =>
      prioSort === "name-asc"
        ? (a.priorityName ?? "").localeCompare(b.priorityName ?? "")
        : (b.priorityName ?? "").localeCompare(a.priorityName ?? "")
    );
  }, [priorities, prioSearch, prioSort]);

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
        <h1 className="text-2xl font-semibold text-ink">Priorities</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded px-4 py-2 text-sm font-medium bg-action hover:bg-action-hover text-action-text transition-colors"
        >
          + New Priority
        </button>
      </div>

      {status === "loading" && (
        <p className="text-ink-muted">Loading priorities…</p>
      )}
      {status === "error" && (
        <p className="text-danger">{error ?? "Failed to load priorities. Try refreshing."}</p>
      )}
      {deleteError && (
        <p role="alert" className="text-sm text-danger mb-2">{deleteError}</p>
      )}

      {status !== "loading" && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <input
              type="text"
              placeholder="Search priorities…"
              value={prioSearch}
              onChange={(e) => setPrioSearch(e.target.value)}
              className={`${controlClass} flex-1 min-w-[140px]`}
            />
            <select
              value={prioSort}
              onChange={(e) => setPrioSort(e.target.value as "name-asc" | "name-desc")}
              className={controlClass}
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            {priorities.length === 0 && status === "idle" && (
              <p className="text-ink-muted text-sm">
                No priorities yet. Create one to get started.
              </p>
            )}
            {priorities.length > 0 && visiblePriorities.length === 0 && (
              <p className="text-ink-muted text-sm">
                No matching priorities.
              </p>
            )}
            {visiblePriorities.map((p) => (
              <PriorityCard key={p.id} priority={p} onEdit={openEdit} onDelete={openDelete} />
            ))}
          </div>
        </>
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
