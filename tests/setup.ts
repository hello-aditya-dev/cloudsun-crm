import "@testing-library/jest-dom/vitest";
import { beforeEach, afterEach, vi } from "vitest";

/**
 * Test setup for CloudSun CRM unit tests.
 *
 * Provides a clean jsdom localStorage before every test and unloads any
 * persisted Zustand store so each test starts from the deterministic seed.
 */

beforeEach(() => {
  // Clear localStorage so the persisted demo store reseeds from demoSeed.
  window.localStorage.clear();
});

afterEach(() => {
  vi.restoreAllMocks();
});
