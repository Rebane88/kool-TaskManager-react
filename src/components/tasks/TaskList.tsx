"use client";

import React from "react";
import { TodoTask } from "@/features/tasks/types/task";
import TaskCard from "@/components/tasks/TaskCard";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { usePriorities } from "@/features/priorities/hooks/usePriorities";

interface TaskListProps {
  tasks: TodoTask[];
  onEdit: (task: TodoTask) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  const { categories } = useCategories();
  const { priorities } = usePriorities();

  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
        No tasks yet. Create your first task.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => {
        const cat = categories.find((c) => c.id === task.todoCategoryId);
        const prio = priorities.find((p) => p.id === task.todoPriorityId);
        return (
          <li key={task.id}>
            <TaskCard
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
              categoryName={cat?.categoryName ?? undefined}
              priorityName={prio?.priorityName ?? undefined}
            />
          </li>
        );
      })}
    </ul>
  );
}
