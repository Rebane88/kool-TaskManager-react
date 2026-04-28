"use client";

/**
 * Priority context provider.
 *
 * Manages priority state using Context + Reducer (ARCH-01 / no prop drilling).
 * Exposes priority actions and status to all consuming components via usePriorities.
 *
 * Priority status states:
 *   "idle"    — no operation in progress
 *   "loading" — fetch or mutation in progress
 *   "error"   — last operation failed
 *
 * Auth gating (Pitfall 4): initial priority fetch is gated on authStatus === "authenticated".
 * PriorityProvider reads useAuth().status and only fetches priorities after auth settles.
 *
 * CRITICAL: priorityService.update returns void (API PUT returns 200 with no body — Pitfall 3).
 * updatePriority dispatches the passed-in updated priority object directly for optimistic state.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { priorityService } from "@/features/priorities/services/priorityService";
import { TodoPriority, CreatePriorityRequest } from "@/features/priorities/types/priority";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { EMPTY_GUID } from "@/lib/constants";
import { formatApiError } from "@/lib/api/apiError";

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

export type PriorityStatus = "idle" | "loading" | "error";

export interface PriorityState {
  priorities: TodoPriority[];
  status: PriorityStatus;
  error: string | null;
}

const initialState: PriorityState = {
  priorities: [],
  status: "idle",
  error: null,
};

// ---------------------------------------------------------------------------
// Reducer actions
// ---------------------------------------------------------------------------

type PriorityAction =
  | { type: "PRIORITIES_LOADING" }
  | { type: "PRIORITIES_LOADED"; payload: TodoPriority[] }
  | { type: "PRIORITIES_ERROR"; payload: string }
  | { type: "PRIORITY_CREATED"; payload: TodoPriority }
  | { type: "PRIORITY_UPDATED"; payload: TodoPriority }
  | { type: "PRIORITY_DELETED"; payload: string }; // payload = priority id

function priorityReducer(state: PriorityState, action: PriorityAction): PriorityState {
  switch (action.type) {
    case "PRIORITIES_LOADING":
      return { ...state, status: "loading", error: null };
    case "PRIORITIES_LOADED":
      return { priorities: action.payload, status: "idle", error: null };
    case "PRIORITIES_ERROR":
      return { ...state, status: "error", error: action.payload };
    case "PRIORITY_CREATED":
      return { ...state, priorities: [...state.priorities, action.payload] };
    case "PRIORITY_UPDATED":
      return {
        ...state,
        priorities: state.priorities.map((p) =>
          p.id === action.payload.id ? action.payload : p
        ),
      };
    case "PRIORITY_DELETED":
      return { ...state, priorities: state.priorities.filter((p) => p.id !== action.payload) };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export interface PriorityContextValue extends PriorityState {
  loadPriorities: () => Promise<void>;
  createPriority: (data: { id?: string; appUserId?: string; priorityName: string; prioritySort: number; syncDt?: string; tag: string | null }) => Promise<void>;
  updatePriority: (id: string, updatedPriority: TodoPriority) => Promise<void>;
  deletePriority: (id: string) => Promise<void>;
}

const PriorityContext = createContext<PriorityContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function PriorityProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(priorityReducer, initialState);
  const { status: authStatus } = useAuth(); // Gate fetch on auth (Pitfall 4)

  // -------------------------------------------------------------------------
  // Initial priority load — gated on authStatus (Pitfall 4 guard)
  // -------------------------------------------------------------------------

  useEffect(() => {
    if (authStatus !== "authenticated") return;
    dispatch({ type: "PRIORITIES_LOADING" });
    priorityService
      .getAll()
      .then((priorities) => {
        dispatch({ type: "PRIORITIES_LOADED", payload: priorities });
      })
      .catch((err: unknown) => {
        const message = formatApiError(err, "Failed to load priorities");
        dispatch({ type: "PRIORITIES_ERROR", payload: message });
      });
  }, [authStatus]);

  // -------------------------------------------------------------------------
  // Priority actions
  // -------------------------------------------------------------------------

  const loadPriorities = useCallback(async (): Promise<void> => {
    dispatch({ type: "PRIORITIES_LOADING" });
    try {
      const priorities = await priorityService.getAll();
      dispatch({ type: "PRIORITIES_LOADED", payload: priorities });
    } catch (err) {
      const message = formatApiError(err, "Failed to load priorities");
      dispatch({ type: "PRIORITIES_ERROR", payload: message });
    }
  }, []);

  const createPriority = useCallback(
    async (data: { id?: string; appUserId?: string; priorityName: string; prioritySort: number; syncDt?: string; tag: string | null }): Promise<void> => {
      try {
        const req: CreatePriorityRequest = {
          id: data.id ?? crypto.randomUUID(),                            // client-generated UUID
          appUserId: data.appUserId ?? EMPTY_GUID,                      // server assigns real user from Bearer token
          priorityName: data.priorityName,
          prioritySort: data.prioritySort,
          syncDt: data.syncDt ?? new Date().toISOString(),
          tag: data.tag,
        };
        const priority = await priorityService.create(req);
        dispatch({ type: "PRIORITY_CREATED", payload: priority });
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const updatePriority = useCallback(
    async (id: string, updatedPriority: TodoPriority): Promise<void> => {
      try {
        // priorityService.update calls priorityApi.update (void) then returns composed request.
        // We call the service for the side effect (API update) but dispatch from the passed-in
        // updatedPriority object directly — this handles the case where the service returns
        // void/undefined (Pitfall 3: API PUT returns no body).
        await priorityService.update(id, updatedPriority, {});
        dispatch({ type: "PRIORITY_UPDATED", payload: updatedPriority });
      } catch (err) {
        throw err;
      }
    },
    []
  );

  const deletePriority = useCallback(async (id: string): Promise<void> => {
    try {
      await priorityService.delete(id);
      dispatch({ type: "PRIORITY_DELETED", payload: id });
    } catch (err) {
      throw err;
    }
  }, []);

  const value: PriorityContextValue = {
    ...state,
    loadPriorities,
    createPriority,
    updatePriority,
    deletePriority,
  };

  return <PriorityContext.Provider value={value}>{children}</PriorityContext.Provider>;
}

// ---------------------------------------------------------------------------
// Context accessor (used by usePriorities hook)
// ---------------------------------------------------------------------------

export function usePriorityContext(): PriorityContextValue {
  const ctx = useContext(PriorityContext);
  if (!ctx) {
    throw new Error("usePriorityContext must be used within a PriorityProvider");
  }
  return ctx;
}
