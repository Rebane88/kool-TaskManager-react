"use client";

import React from "react";
import { TodoPriority } from "@/features/priorities/types/priority";
import PriorityForm from "@/components/priorities/PriorityForm";

interface PriorityModalProps {
  isOpen: boolean;
  priority: TodoPriority | null;
  onClose: () => void;
}

export default function PriorityModal({ isOpen, priority, onClose }: PriorityModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="priority-modal-title"
    >
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
        <h2 id="priority-modal-title" className="text-base font-semibold mb-4">
          {priority ? "Edit Priority" : "New Priority"}
        </h2>
        <PriorityForm priority={priority} onClose={onClose} />
      </div>
    </div>
  );
}
