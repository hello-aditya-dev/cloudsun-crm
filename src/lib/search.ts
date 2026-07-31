/**
 * CloudSun — search normalization utilities.
 *
 * Centralizes the normalization used by repository search across contacts,
 * companies and conversations. Removes diacritics, collapses whitespace and
 * lower-cases so that "Álvarez" matches "alvarez" and "de Vries" matches
 * "de vries".
 */

/**
 * Normalize a string for case- and diacritic-insensitive matching.
 *
 * - Lowercases
 * - Strips combining diacritical marks (NFD → strip → NFC)
 * - Collapses internal whitespace runs to a single space
 * - Trims leading/trailing whitespace
 *
 * Returns an empty string for null/undefined/non-string input.
 */
export function normalizeSearch(input: unknown): string {
  if (typeof input !== "string") return "";
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // strip combining diacritical marks
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/**
 * Test whether a haystack contains every token of a needle query.
 *
 * The query is normalized and split on whitespace; every token must appear
 * (in order-independent fashion) somewhere in the normalized haystack. This
 * lets "wei lin" match "Wei-Lin Tan" and "eleanor whit" match "Eleanor Whitfield".
 */
export function matchesQuery(haystack: unknown, query: string): boolean {
  const q = normalizeSearch(query);
  if (!q) return true; // empty query matches everything
  const text = normalizeSearch(haystack);
  if (!text) return false;
  return q.split(" ").every((token) => text.includes(token));
}

/**
 * Join an array of strings into a single searchable haystack.
 * Nullish entries are skipped so that missing fields do not introduce stray
 * "null" / "undefined" tokens.
 */
export function toHaystack(parts: Array<string | null | undefined>): string {
  return normalizeSearch(parts.filter(Boolean).join(" "));
}
