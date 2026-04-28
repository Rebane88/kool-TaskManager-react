"use client";

/**
 * Category context provider.
 *
 * Manages category state using Context + Reducer (ARCH-01 / no prop drilling).
 * Exposes category actions and status to all consuming components via useCategories.
 *
 * Category status states:
 *   "idle"    — no operation in progress
 *   "loading" — fetch or mutation in progress
 *   "error"   — last operation failed
 *
 * Auth gating (Pitfall 4): initial category fetch is gated on authStatus === "authenticated".
 * CategoryProvider reads useAuth().status and only fetches categories after auth settles.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { categoryService } from "@/features/categories/services/categoryService";
import { TodoCategory, CreateCategoryRequest, UpdateCategoryRequest } from "@/features/categories/types/category";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { formatApiError } from "@/lib/api/apiError";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type CategoryStatus = "idle" | "loading" | "error";

export interface CategoryState {
  categories: TodoCategory[];
  status: CategoryStatus;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  status: "idle",
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type CategoryAction =
  | { type: "CATEGORIES_LOADING" }
  | { type: "CATEGORIES_LOADED"; payload: TodoCategory[] }
  | { type: "CATEGORIES_ERROR"; payload: string }
  | { type: "CATEGORY_CREATED"; payload: TodoCategory }
  | { type: "CATEGORY_UPDATED"; payload: TodoCategory }
  | { type: "CATEGORY_DELETED"; payload: string }; // payload = category id

function categoryReducer(state: CategoryState, action: CategoryAction): CategoryState {
  switch (action.type) {
    case "CATEGORIES_LOADING":
      return { ...state, status: "loading", error: null };
    case "CATEGORIES_LOADED":
      return { categories: action.payload, status: "idle", error: null };
    case "CATEGORIES_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "CATEGORY_CREATED":
      return { ...state, categories: [...state.categories, action.payload] };
    case "CATEGORY_UPDATED":
      return {
        ...state,
        categories: state.categories.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "CATEGORY_DELETED":
      return { ...state, categories: state.categories.filter((c) => c.id !== action.payload) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface CategoryContextValue extends CategoryState {
  loadCategories: () => Promise<void>;
  createCategory: (data: { id?: string; categoryName: string; categorySort: number; tag: string | null }) => Promise<void>;
  updateCategory: (id: string, updatedCategory: TodoCategory) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

const CategoryContext = createContext<CategoryContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(categoryReducer, initialState);
  const { status: authStatus } = useAuth(); // Gate fetch on auth (Pitfall 4)

  // -------------------------------------------------------------------------
  // Initial category load — gated on authStatus (Pitfall 4 guard)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    dispatch({ type: "CATEGORIES_LOADING" });
    categoryService
      .getAll()
      .then((categories) => {
        dispatch({ type: "CATEGORIES_LOADED", payload: categories });
      })
      .catch((err: unknown) => {
        const message = formatApiError(err, "Failed to load categories");
        dispatch({ type: "CATEGORIES_ERROR", payload: message });
      });
  }, [authStatus]);

  // -------------------------------------------------------------------------
  // Category actions
  // -------------------------------------------------------------------------

  const loadCategories = useCallback(async (): Promise<void> => {
    dispatch({ type: "CATEGORIES_LOADING" });
    try {
      const categories = await categoryService.getAll();
      dispatch({ type: "CATEGORIES_LOADED", payload: categories });
    } catch (err) {
      const message = formatApiError(err, "Failed to load categories");
      dispatch({ type: "CATEGORIES_ERROR", payload: message });
    }
  }, []);

  const createCategory = useCallback(
    async (data: { id?: string; categoryName: string; categorySort: number; tag: string | null }): Promise<void> => {
      try {
        const req: CreateCategoryRequest = {
          id: data.id ?? crypto.randomUUID(), // client-generated UUID per RESEARCH.md §2
          categoryName: data.categoryName,
          categorySort: data.categorySort,
          tag: data.tag,
        };
        const category = await categoryService.create(req);
        dispatch({ type: "CATEGORY_CREATED", payload: category });
      } catch (err) {
        throw err; // form handles display via formatApiError
      }
    },
    []
  );

  const updateCategory = useCallback(
    async (id: string, updatedCategory: TodoCategory): Promise<void> => {
      try {
        const changes: Partial<Omit<UpdateCategoryRequest, "id" | "syncDt">> = {
          categoryName: updatedCategory.categoryName ?? "",
          categorySort: updatedCategory.categorySort,
          tag: updatedCategory.tag,
        };
        const category = await categoryService.update(id, updatedCategory, changes);
        dispatch({ type: "CATEGORY_UPDATED", payload: category });
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    try {
      await categoryService.delete(id);
      dispatch({ type: "CATEGORY_DELETED", payload: id });
    } catch (err) {
      throw err;
    }
  }, []);

  const value: CategoryContextValue = {
    ...state,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };

  return <CategoryContext.Provider value={value}>{children}</CategoryContext.Provider>;
}

// ---------------------------------------------------------------------------
// Context accessor (used by useCategories hook)
// ---------------------------------------------------------------------------

export function useCategoryContext(): CategoryContextValue {
  const ctx = useContext(CategoryContext);
  if (!ctx) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return ctx;
}
