/**
 * usePriorities hook.
 *
 * Exposes priority state and actions from PriorityProvider context.
 * Must be used within a <PriorityProvider> tree.
 *
 * Returns:
 *   priorities          — current priority array from reducer state
 *   status              — "idle" | "loading" | "error"
 *   error               — error message from last failed action, or null
 *   loadPriorities()    — manually re-fetch all priorities
 *   createPriority(data) — create a new priority
 *   updatePriority(id, updatedPriority) — update an existing priority
 *   deletePriority(id)  — delete a priority by id
 */

import { usePriorityContext } from "@/features/priorities/state/PriorityProvider";

export { type PriorityContextValue as PriorityContextShape } from "@/features/priorities/state/PriorityProvider";

export function usePriorities() {
  return usePriorityContext();
}
