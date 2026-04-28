/**
 * Task domain types — derived from TalTech OpenAPI schema (apiendpoints.json).
 *
 * TodoTask: full entity returned from GET/POST/PUT /api/v1/TodoTasks
 * CreateTaskRequest: body for POST /api/v1/TodoTasks
 * UpdateTaskRequest: body for PUT /api/v1/TodoTasks/{id}
 *   NOTE: PUT replaces the full resource — send all fields (Pitfall 1).
 */

export interface TodoTask {
  id: string;             // uuid, server-assigned
  taskName: string | null; // maxLength 128
  taskSort: number;        // int32; default 0 on create
  createdDt: string;       // ISO 8601, server-assigned on POST; echo on PUT
  dueDt: string | null;    // ISO 8601, nullable; user-controlled optional due date
  isCompleted: boolean;
  isArchived: boolean;          // always false in Phase 2
  todoCategoryId: string;  // uuid; non-nullable per API schema (nullable=false)
  todoPriorityId: string;  // uuid; non-nullable per API schema (nullable=false)
  syncDt: string;          // ISO 8601; send current timestamp on write
}

export interface CreateTaskRequest {
  taskName: string;
  taskSort: number;
  dueDt: string | null;
  isCompleted: false;       // literal false — new tasks are never pre-completed
  isArchived: false;        // literal false — archive not exposed in Phase 2
  todoCategoryId: string;
  todoPriorityId: string;
  syncDt: string;
}

export interface UpdateTaskRequest extends Omit<CreateTaskRequest, "isCompleted" | "isArchived"> {
  id: string;         // required: included in body for PUT (full replacement)
  createdDt: string;  // echo back original server-assigned creation timestamp
  isCompleted: boolean;  // override literal false — updates can toggle completion state
  isArchived: boolean;   // override literal false — updates can set archived state
}
