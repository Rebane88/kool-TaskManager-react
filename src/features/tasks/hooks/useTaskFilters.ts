"use client";

import { useState, useMemo } from "react";
import { TodoTask } from "@/features/tasks/types/task";
import { TodoCategory } from "@/features/categories/types/category";
import { TodoPriority } from "@/features/priorities/types/priority";

export type SortOption =
  | "dueDate-asc"
  | "dueDate-desc"
  | "name-asc"
  | "name-desc"
  | "created-desc"
  | "created-asc";

export type StatusFilter = "all" | "active" | "completed";

export function useTaskFilters(
  tasks: TodoTask[],
  _categories: TodoCategory[],
  _priorities: TodoPriority[]
) {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [priorityId, setPriorityId] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("dueDate-asc");

  const visibleTasks = useMemo(() => {
    let result = tasks;

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter((t) => t.taskName?.toLowerCase().includes(q));
    }

    if (categoryId) {
      result = result.filter((t) => t.todoCategoryId === categoryId);
    }

    if (priorityId) {
      result = result.filter((t) => t.todoPriorityId === priorityId);
    }

    if (statusFilter === "active") {
      result = result.filter((t) => !t.isCompleted);
    } else if (statusFilter === "completed") {
      result = result.filter((t) => t.isCompleted);
    }

    return [...result].sort((a, b) => {
      switch (sortBy) {
        case "dueDate-asc": {
          if (!a.dueDt && !b.dueDt) return 0;
          if (!a.dueDt) return 1;
          if (!b.dueDt) return -1;
          return a.dueDt.localeCompare(b.dueDt);
        }
        case "dueDate-desc": {
          if (!a.dueDt && !b.dueDt) return 0;
          if (!a.dueDt) return 1;
          if (!b.dueDt) return -1;
          return b.dueDt.localeCompare(a.dueDt);
        }
        case "name-asc":
          return (a.taskName ?? "").localeCompare(b.taskName ?? "");
        case "name-desc":
          return (b.taskName ?? "").localeCompare(a.taskName ?? "");
        case "created-desc":
          return b.createdDt.localeCompare(a.createdDt);
        case "created-asc":
          return a.createdDt.localeCompare(b.createdDt);
        default:
          return 0;
      }
    });
  }, [tasks, search, categoryId, priorityId, statusFilter, sortBy]);

  return {
    visibleTasks,
    search,
    setSearch,
    categoryId,
    setCategoryId,
    priorityId,
    setPriorityId,
    statusFilter,
    setStatusFilter,
    sortBy,
    setSortBy,
  };
}
