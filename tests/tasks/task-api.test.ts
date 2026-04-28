/**
 * taskApi unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/tasks/api/taskApi which does not yet exist.
 * They are intentionally in RED state until taskApi is implemented in Wave 1.
 *
 * Covers:
 *  - TASK-01: taskApi.create sends POST with correct body and Bearer token
 *  - TASK-02: taskApi.getAll sends GET with Bearer token, returns TodoTask[]
 *  - TASK-03: taskApi.update sends PUT with full task body and Bearer token
 *  - TASK-04: taskApi.delete sends DELETE with Bearer token, handles no-body 200 (Pitfall 3)
 *  - TASK-05: taskApi toggle via update sends PUT with isCompleted: true
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { taskApi } from "@/features/tasks/api/taskApi";

// ---------------------------------------------------------------------------
// Fetch mock helper
// ---------------------------------------------------------------------------

function makeFetchMock(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as unknown as Response);
}

const fakeTasks = [
  {
    id: "task-uuid-1",
    taskName: "First task",
    taskSort: 0,
    createdDt: "2026-01-01T00:00:00Z",
    dueDt: null,
    isCompleted: false,
    isArchived: false,
    todoCategoryId: null,
    todoPriorityId: null,
    syncDt: "2026-01-01T00:00:00Z",
  },
];

const fakeTask = fakeTasks[0];

// ---------------------------------------------------------------------------
// TASK-02: taskApi.getAll
// ---------------------------------------------------------------------------

describe("taskApi.getAll — TASK-02", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends GET to /api/v1/TodoTasks with Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeTasks,
      text: async () => JSON.stringify(fakeTasks),
    } as unknown as Response);

    await taskApi.getAll();

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoTasks");
    expect((init as RequestInit).method).toBe("GET");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("returns array of TodoTask from response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeTasks,
      text: async () => JSON.stringify(fakeTasks),
    } as unknown as Response);

    const result = await taskApi.getAll();

    expect(result).toEqual(fakeTasks);
  });
});

// ---------------------------------------------------------------------------
// TASK-01: taskApi.create
// ---------------------------------------------------------------------------

describe("taskApi.create — TASK-01", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends POST to /api/v1/TodoTasks with request body and Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeTask,
      text: async () => JSON.stringify(fakeTask),
    } as unknown as Response);

    const createReq = {
      taskName: "First task",
      taskSort: 0,
      dueDt: null,
      isCompleted: false as const,
      isArchived: false as const,
      todoCategoryId: null,
      todoPriorityId: null,
      syncDt: "2026-01-01T00:00:00Z",
    };

    await taskApi.create(createReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain("TodoTasks");
    expect((init as RequestInit).method).toBe("POST");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
    expect((init as RequestInit).body).toBe(JSON.stringify(createReq));
  });

  it("returns created TodoTask from response body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => fakeTask,
      text: async () => JSON.stringify(fakeTask),
    } as unknown as Response);

    const result = await taskApi.create({
      taskName: "First task",
      taskSort: 0,
      dueDt: null,
      isCompleted: false as const,
      isArchived: false as const,
      todoCategoryId: null,
      todoPriorityId: null,
      syncDt: "2026-01-01T00:00:00Z",
    });

    expect(result).toEqual(fakeTask);
  });
});

// ---------------------------------------------------------------------------
// TASK-03: taskApi.update
// ---------------------------------------------------------------------------

describe("taskApi.update — TASK-03", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends PUT to /api/v1/TodoTasks/{id} with full task body and Bearer token", async () => {
    const updatedTask = { ...fakeTask, taskName: "Updated task" };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => updatedTask,
      text: async () => JSON.stringify(updatedTask),
    } as unknown as Response);

    const updateReq = {
      id: fakeTask.id,
      taskName: "Updated task",
      taskSort: 0,
      createdDt: "2026-01-01T00:00:00Z",
      dueDt: null,
      isCompleted: false as const,
      isArchived: false as const,
      todoCategoryId: null,
      todoPriorityId: null,
      syncDt: "2026-01-01T00:00:00Z",
    };

    await taskApi.update(fakeTask.id, updateReq);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain(`TodoTasks/${fakeTask.id}`);
    expect((init as RequestInit).method).toBe("PUT");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("returns updated TodoTask from response body", async () => {
    const updatedTask = { ...fakeTask, taskName: "Updated task" };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => updatedTask,
      text: async () => JSON.stringify(updatedTask),
    } as unknown as Response);

    const updateReq = {
      id: fakeTask.id,
      taskName: "Updated task",
      taskSort: 0,
      createdDt: "2026-01-01T00:00:00Z",
      dueDt: null,
      isCompleted: false as const,
      isArchived: false as const,
      todoCategoryId: null,
      todoPriorityId: null,
      syncDt: "2026-01-01T00:00:00Z",
    };

    const result = await taskApi.update(fakeTask.id, updateReq);

    expect(result).toEqual(updatedTask);
  });
});

// ---------------------------------------------------------------------------
// TASK-04: taskApi.delete
// ---------------------------------------------------------------------------

describe("taskApi.delete — TASK-04", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends DELETE to /api/v1/TodoTasks/{id} with Bearer token", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => null,
      text: async () => "",
    } as unknown as Response);

    await taskApi.delete(fakeTask.id);

    const [url, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(String(url)).toContain(`TodoTasks/${fakeTask.id}`);
    expect((init as RequestInit).method).toBe("DELETE");
    expect(
      ((init as RequestInit).headers as Record<string, string>)["Authorization"]
    ).toMatch(/^Bearer /);
  });

  it("does not throw when response has no JSON body (Pitfall 3 guard)", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError("Unexpected end of JSON input");
      },
      text: async () => "",
    } as unknown as Response);

    await expect(taskApi.delete("some-id")).resolves.not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// TASK-05: taskApi toggle via update
// ---------------------------------------------------------------------------

describe("taskApi toggle via update — TASK-05", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("sends PUT with isCompleted: true when toggling complete", async () => {
    const completedTask = { ...fakeTask, isCompleted: true };

    vi.spyOn(globalThis, "fetch").mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => completedTask,
      text: async () => JSON.stringify(completedTask),
    } as unknown as Response);

    const updateReq = {
      id: fakeTask.id,
      taskName: fakeTask.taskName ?? "",
      taskSort: fakeTask.taskSort,
      createdDt: fakeTask.createdDt,
      dueDt: fakeTask.dueDt,
      isCompleted: true as const,
      isArchived: false as const,
      todoCategoryId: fakeTask.todoCategoryId,
      todoPriorityId: fakeTask.todoPriorityId,
      syncDt: new Date().toISOString(),
    };

    await taskApi.update(fakeTask.id, updateReq);

    const [, init] = vi.mocked(globalThis.fetch).mock.calls[0];
    const body = JSON.parse((init as RequestInit).body as string);
    expect(body.isCompleted).toBe(true);
  });
});
