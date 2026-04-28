"use client";

import React from "react";
import { TodoTask } from "@/features/tasks/types/task";
import TaskCard from "@/components/tasks/TaskCard";

interface TaskListProps {
  tasks: TodoTask[];
  onEdit: (task: TodoTask) => void;
  onDelete: (id: string) => void;
}

export default function TaskList({ tasks, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-gray-500 dark:text-gray-400 py-8 text-center">
        No tasks yet. Create your first task.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {tasks.map((task) => (
        <li key={task.id}>
          <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
        </li>
      ))}
    </ul>
  );
}
