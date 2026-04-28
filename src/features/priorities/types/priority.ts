/**
 * Priority domain types — derived from TalTech OpenAPI schema (apiendpoints.json).
 *
 * TodoPriority: full entity returned from GET/POST /api/v1/TodoPriorities
 * CreatePriorityRequest: body for POST /api/v1/TodoPriorities
 * UpdatePriorityRequest: body for PUT /api/v1/TodoPriorities/{id}
 *   NOTE: PUT replaces the full resource — send all fields (Pitfall 1).
 *   NOTE: PUT returns 200 with NO body — use apiClient<unknown> and discard result (Pitfall 3).
 */

// TodoPriority — read schema and also used as the response from POST (status 200, not 201)
export interface TodoPriority {
  id: string;                    // uuid
  appUserId: string;             // uuid — server-assigned based on Bearer token
  priorityName: string | null;   // maxLength 128
  prioritySort: number;          // int32
  syncDt: string;                // ISO 8601 datetime
  tag: string | null;            // not shown in Phase 3 UI
}

// POST uses full TodoPriority schema — client generates id, sends EMPTY_GUID for appUserId
export interface CreatePriorityRequest {
  id: string;               // uuid — use crypto.randomUUID() on create
  appUserId: string;        // send "00000000-0000-0000-0000-000000000000" — server assigns real user
  priorityName: string;     // maxLength 128; required in UI
  prioritySort: number;     // default 0
  syncDt: string;           // new Date().toISOString()
  tag: string | null;       // send null
}

// PUT uses same schema — preserve appUserId from existing record
export interface UpdatePriorityRequest extends CreatePriorityRequest {
  // identical shape — spread existing priority, update name/sort, refresh syncDt, preserve appUserId
}
