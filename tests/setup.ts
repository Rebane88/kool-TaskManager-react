import "@testing-library/jest-dom";

/**
 * Provide a functional localStorage/sessionStorage mock for Node v25+.
 *
 * Node v25 ships a built-in `localStorage` global backed by --localstorage-file,
 * which shadows the jsdom/happy-dom implementations when no file path is provided.
 * We replace both globals with an in-memory implementation that behaves like the
 * Web Storage spec (setItem, getItem, removeItem, clear, length, key).
 */
function createStorageMock(): Storage {
  let store: Record<string, string> = {};

  return {
    get length() {
      return Object.keys(store).length;
    },
    key(index: number): string | null {
      return Object.keys(store)[index] ?? null;
    },
    getItem(key: string): string | null {
      return Object.prototype.hasOwnProperty.call(store, key)
        ? store[key]
        : null;
    },
    setItem(key: string, value: string): void {
      store[key] = String(value);
    },
    removeItem(key: string): void {
      delete store[key];
    },
    clear(): void {
      store = {};
    },
  };
}

Object.defineProperty(globalThis, "localStorage", {
  value: createStorageMock(),
  writable: true,
});

Object.defineProperty(globalThis, "sessionStorage", {
  value: createStorageMock(),
  writable: true,
});
