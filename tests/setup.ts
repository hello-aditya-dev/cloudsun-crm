import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach, vi } from "vitest";

/**
 * Test setup for CloudSun CRM unit and component tests.
 *
 * Provides a clean jsdom localStorage before every test and unloads any
 * persisted Zustand store so each test starts from the deterministic seed.
 * Also polyfills jsdom gaps (scrollIntoView, matchMedia) that real browsers
 * provide but jsdom does not.
 */

// jsdom does not implement Element.scrollIntoView — components like the
// CommandPalette call it in a layout effect. Provide a no-op so the effect
// does not throw.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

// jsdom does not implement window.matchMedia — next-themes and other
// libraries query it. Provide a minimal stub.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

beforeEach(() => {
  // Clear localStorage so the persisted demo store reseeds from demoSeed.
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
