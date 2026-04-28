/**
 * Category domain types — derived from TalTech OpenAPI schema (apiendpoints.json).
 *
 * TodoCategory: full entity returned from GET/POST/PUT /api/v1/TodoCategories
 * CreateCategoryRequest: body for POST /api/v1/TodoCategories
 * UpdateCategoryRequest: body for PUT /api/v1/TodoCategories/{id}
 *   NOTE: PUT replaces the full resource — send all fields (Pitfall 1).
 */

// TodoCategoryCreate POST body — id is client-generated
export interface CreateCategoryRequest {
  id: string;               // uuid — use crypto.randomUUID() on create
  categoryName: string;     // maxLength 128
  categorySort: number;     // default 0
  tag: string | null;       // send null (not exposed in Phase 3 UI)
}

// TodoCategoryEdit PUT body — includes syncDt, absent from create DTO
export interface UpdateCategoryRequest {
  id: string;
  categoryName: string;
  categorySort: number;
  tag: string | null;
  syncDt: string;           // send new Date().toISOString() on every edit
}

// TodoCategory — read schema returned by GET/POST/PUT
export interface TodoCategory {
  id: string;
  categoryName: string | null;  // server may return null
  categorySort: number;
  syncDt: string;
  tag: string | null;
}
