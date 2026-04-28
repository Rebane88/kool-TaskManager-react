/**
 * CategoryProvider unit test stubs — Wave 0 (RED state)
 *
 * These tests import from @/features/categories/state/CategoryProvider,
 * @/features/categories/hooks/useCategories, and
 * @/features/categories/services/categoryService — none of which exist yet.
 * They are intentionally in RED state until the category feature module is
 * implemented in Wave 1.
 *
 * Covers:
 *  - CATE-02: CategoryProvider loads categories when auth status is authenticated
 *  - CATE-01: createCategory dispatches CATEGORY_CREATED and adds to state
 *  - CATE-03: updateCategory dispatches CATEGORY_UPDATED and replaces in state
 *  - CATE-04: deleteCategory dispatches CATEGORY_DELETED and removes from state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import React from "react";
import { CategoryProvider } from "@/features/categories/state/CategoryProvider";
import { useCategories } from "@/features/categories/hooks/useCategories";
import { categoryService } from "@/features/categories/services/categoryService";

// Mock categoryService — no real API calls in unit tests
vi.mock("@/features/categories/services/categoryService", () => ({
  categoryService: {
    getAll: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock useAuth — CategoryProvider gates fetch on auth status
vi.mock("@/features/auth/hooks/useAuth", () => ({
  useAuth: () => ({ status: "authenticated" }),
}));

const fakeCategory = {
  id: "cat-uuid-1",
  categoryName: "Work",
  categorySort: 0,
  syncDt: "2026-01-01T00:00:00Z",
  tag: null,
};

let capturedCtx: ReturnType<typeof useCategories> | null = null;

function TestConsumer() {
  capturedCtx = useCategories();
  return <div data-testid="category-status">{capturedCtx.status}</div>;
}

function renderWithProvider() {
  capturedCtx = null;
  return render(
    <CategoryProvider>
      <TestConsumer />
    </CategoryProvider>
  );
}

// ---------------------------------------------------------------------------
// CATE-02: CategoryProvider initial load
// ---------------------------------------------------------------------------

describe("CategoryProvider: initial load — CATE-02", () => {
  beforeEach(() => {
    vi.mocked(categoryService.getAll).mockResolvedValue([]);
  });

  it("calls categoryService.getAll when auth status is authenticated", async () => {
    renderWithProvider();
    await act(async () => {});

    expect(categoryService.getAll).toHaveBeenCalled();
  });

  it("sets status to idle after categories load", async () => {
    renderWithProvider();
    await act(async () => {});

    expect(screen.getByTestId("category-status").textContent).toBe("idle");
  });
});

// ---------------------------------------------------------------------------
// CATE-01: CategoryProvider createCategory
// ---------------------------------------------------------------------------

describe("CategoryProvider: createCategory — CATE-01", () => {
  it("dispatches CATEGORY_CREATED and adds category to state after successful create", async () => {
    vi.mocked(categoryService.create).mockResolvedValue(fakeCategory);

    renderWithProvider();
    await act(async () => {
      await capturedCtx!.createCategory({
        id: "cat-uuid-1",
        categoryName: "Work",
        categorySort: 0,
        tag: null,
      });
    });

    expect(capturedCtx!.categories).toContainEqual(fakeCategory);
  });
});

// ---------------------------------------------------------------------------
// CATE-03: CategoryProvider updateCategory
// ---------------------------------------------------------------------------

describe("CategoryProvider: updateCategory — CATE-03", () => {
  it("dispatches CATEGORY_UPDATED and replaces category in state after successful update", async () => {
    // Set up: load fakeCategory into state first via create
    vi.mocked(categoryService.create).mockResolvedValue(fakeCategory);
    const updatedCategory = { ...fakeCategory, categoryName: "Work Updated" };
    vi.mocked(categoryService.update).mockResolvedValue(updatedCategory);

    renderWithProvider();

    // First add the category to state
    await act(async () => {
      await capturedCtx!.createCategory({
        id: "cat-uuid-1",
        categoryName: "Work",
        categorySort: 0,
        tag: null,
      });
    });

    // Then update it
    await act(async () => {
      await capturedCtx!.updateCategory("cat-uuid-1", {
        id: "cat-uuid-1",
        categoryName: "Work Updated",
        categorySort: 0,
        tag: null,
        syncDt: "2026-01-01T00:00:00Z",
      });
    });

    expect(capturedCtx!.categories).toContainEqual(updatedCategory);
  });
});

// ---------------------------------------------------------------------------
// CATE-04: CategoryProvider deleteCategory
// ---------------------------------------------------------------------------

describe("CategoryProvider: deleteCategory — CATE-04", () => {
  it("dispatches CATEGORY_DELETED and removes category from state after successful delete", async () => {
    // Load fakeCategory into state first
    vi.mocked(categoryService.create).mockResolvedValue(fakeCategory);
    vi.mocked(categoryService.delete).mockResolvedValue(undefined);

    renderWithProvider();

    // Add category to state
    await act(async () => {
      await capturedCtx!.createCategory({
        id: "cat-uuid-1",
        categoryName: "Work",
        categorySort: 0,
        tag: null,
      });
    });

    // Delete it
    await act(async () => {
      await capturedCtx!.deleteCategory("cat-uuid-1");
    });

    expect(capturedCtx!.categories).not.toContainEqual(fakeCategory);
  });
});
