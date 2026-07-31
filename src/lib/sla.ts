/**
 * CloudSun — SLA (service-level agreement) computation helpers.
 *
 * Conversations carry a denormalised `slaState` for display, but the source
 * of truth is `slaDueAt`. These helpers re-derive the live SLA state from the
 * due date so the UI never shows a stale "safe" badge when the deadline has
 * actually passed.
 *
 * The SLA clock is paused when a conversation is snoozed or waiting on the
 * customer — callers pass the stored `slaState` so a "paused" override is
 * respected even when `slaDueAt` is in the past.
 */

import type { Conversation, SlaState } from "@/types/domain";

/** Thresholds expressed as a fraction of the total SLA window remaining. */
const APPROACHING_THRESHOLD = 0.5; // < 50% of window remaining
const AT_RISK_THRESHOLD = 0.25; // < 25% of window remaining

/**
 * Derive the live SLA state for a conversation.
 *
 * @param dueAt     ISO timestamp of the SLA deadline, or null when no SLA applies.
 * @param now       Current time (injectable for tests).
 * @param paused    When true, the SLA clock is held (snoozed / waiting on customer).
 * @param createdAt ISO timestamp the conversation (and SLA window) started.
 */
export function computeSlaState(
  dueAt: string | null,
  now: Date = new Date(),
  paused = false,
  createdAt?: string,
): SlaState {
  if (paused) return "paused";
  if (!dueAt) return "safe";

  const nowMs = now.getTime();
  const dueMs = new Date(dueAt).getTime();

  if (Number.isNaN(dueMs)) return "safe";

  if (nowMs > dueMs) return "breached";

  // No creation date → cannot compute remaining window ratio, fall back to
  // absolute time-to-deadline bands.
  if (!createdAt) {
    const remainingMs = dueMs - nowMs;
    const oneHour = 60 * 60 * 1000;
    if (remainingMs <= oneHour) return "at_risk";
    if (remainingMs <= 4 * oneHour) return "approaching";
    return "safe";
  }

  const createdMs = new Date(createdAt).getTime();
  if (Number.isNaN(createdMs) || createdMs >= dueMs) {
    // Malformed window — treat by absolute remaining time.
    const remainingMs = dueMs - nowMs;
    return remainingMs <= 0 ? "breached" : remainingMs <= 4 * 60 * 60 * 1000 ? "approaching" : "safe";
  }

  const totalWindow = dueMs - createdMs;
  const remaining = dueMs - nowMs;
  const ratio = remaining / totalWindow;

  if (ratio <= AT_RISK_THRESHOLD) return "at_risk";
  if (ratio <= APPROACHING_THRESHOLD) return "approaching";
  return "safe";
}

/**
 * Resolve the effective SLA state for a conversation, honouring its stored
 * paused flag (snoozed conversations hold the clock).
 */
export function resolveSlaState(conversation: Conversation, now: Date = new Date()): SlaState {
  const paused =
    conversation.slaState === "paused" ||
    conversation.status === "snoozed" ||
    conversation.status === "waiting_customer";
  return computeSlaState(conversation.slaDueAt, now, paused, conversation.createdAt);
}

/** Human-readable explanation of an SLA state — never colour-only. */
export function describeSlaState(state: SlaState): string {
  switch (state) {
    case "safe":
      return "Within SLA. Response time is on track.";
    case "approaching":
      return "SLA approaching. Less than half the response window remains.";
    case "at_risk":
      return "SLA at risk. Response window is nearly exhausted.";
    case "breached":
      return "SLA breached. Response deadline has passed.";
    case "paused":
      return "SLA paused. Clock is held while snoozed or waiting on the customer.";
  }
}

/** Minutes remaining until the SLA deadline (negative when breached). */
export function slaMinutesRemaining(dueAt: string | null, now: Date = new Date()): number | null {
  if (!dueAt) return null;
  const dueMs = new Date(dueAt).getTime();
  if (Number.isNaN(dueMs)) return null;
  return Math.round((dueMs - now.getTime()) / 60000);
}
