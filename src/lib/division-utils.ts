/**
 * @fileoverview Division utility functions for the Studio platform.
 *
 * Divisions are lightweight organizational sub-groups inside a single Event
 * (League or Tournament). They inherit all event-level defaults (registration,
 * forms, payments, staff) unless explicitly overridden.
 *
 * Backwards compatibility: older League documents store divisions as `string[]`.
 * All read paths must go through `normalizeDivisions()` so the UI always works
 * with a consistent `Division[]` shape regardless of what's in Firestore.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Division = {
  /** Slug-safe identifier, e.g. 'gold', 'u12-boys'. Derived from name on creation. */
  id: string;
  /** Human-readable display name, e.g. 'Gold', 'U12 Boys'. */
  name: string;
  // ── Optional per-division overrides (inherit from event if absent) ──
  fees?: string;
  rosterLimit?: number;
  rules?: string;
  registrationCap?: number;
  playoffSettings?: {
    format?: 'single_elimination' | 'double_elimination' | 'round_robin';
    teamsAdvancing?: number;
  };
  createdAt?: string;
};

// ─── Core Utilities ────────────────────────────────────────────────────────────

/**
 * Normalizes the `divisions` field from a League or TeamEvent document into a
 * consistent `Division[]` shape.
 *
 * Handles three states stored in Firestore:
 *   1. `undefined` / `null` / `[]`  → returns `[]`
 *   2. Legacy `string[]`            → maps each name to a `Division` with a derived id
 *   3. Modern `Division[]`          → returned as-is
 */
export function normalizeDivisions(raw: string[] | Division[] | undefined | null): Division[] {
  if (!raw || raw.length === 0) return [];
  if (typeof raw[0] === 'string') {
    return (raw as string[]).map(name => ({
      id: slugify(name),
      name,
    }));
  }
  return raw as Division[];
}

/**
 * Checks whether a team's division assignment matches the active division filter.
 *
 * Handles both modern (ID-based) and legacy (name-based) division strings so
 * existing data works without migration.
 *
 * @param teamDivision - The division string on the team/entry record. May be a
 *                       legacy display name like 'Gold' or a modern ID like 'gold'.
 * @param filterDivisionId - The ID of the division being filtered for, or `null`
 *                           to show all divisions.
 */
export function divisionMatchesFilter(
  teamDivision: string | undefined | null,
  filterDivisionId: string | null
): boolean {
  if (!filterDivisionId) return true;
  if (!teamDivision) return false;
  // Exact ID match (modern data)
  if (teamDivision === filterDivisionId) return true;
  // Legacy name → slug comparison (old data stored name strings like 'Gold Division')
  return slugify(teamDivision) === filterDivisionId;
}

/**
 * Creates a new Division object from a display name.
 * Derives a URL/slug-safe ID automatically.
 */
export function createDivision(name: string): Division {
  return {
    id: slugify(name),
    name: name.trim(),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Returns a Division from a list by ID, with fallback to name comparison
 * for legacy data.
 */
export function findDivision(
  divisions: Division[],
  idOrName: string | undefined | null
): Division | undefined {
  if (!idOrName) return undefined;
  return (
    divisions.find(d => d.id === idOrName) ||
    divisions.find(d => slugify(d.name) === slugify(idOrName)) ||
    divisions.find(d => d.name === idOrName)
  );
}

/**
 * Returns a human-readable label for a division given its ID or name.
 * Falls back to the raw string if no match found (graceful degradation).
 */
export function getDivisionLabel(
  divisions: Division[],
  idOrName: string | undefined | null
): string {
  if (!idOrName) return '';
  const found = findDivision(divisions, idOrName);
  return found?.name ?? idOrName;
}

// ─── Internal ─────────────────────────────────────────────────────────────────

/**
 * Converts any string to a URL-safe, lowercase slug.
 * 'U12 Boys / Gold' → 'u12-boys-gold'
 */
export function slugify(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
