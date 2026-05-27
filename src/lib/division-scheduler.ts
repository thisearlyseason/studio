/**
 * @fileoverview Division-aware schedule generation wrapper.
 *
 * This module wraps the core `generateIntelligentLeagueSchedule` function to
 * add per-division scheduling. When a league has divisions defined, teams are
 * partitioned by division and a separate schedule is generated for each
 * division. Games are tagged with `divisionId` so the UI can filter them.
 *
 * Events without divisions are unaffected — the core scheduler is called
 * exactly as before with no changes to its algorithm.
 */

import { TournamentGame } from '@/components/providers/team-provider';
import { Division, normalizeDivisions, divisionMatchesFilter } from './division-utils';
import { generateIntelligentLeagueSchedule, IntelligentConfig } from './intelligent-scheduler';
import { TeamIdentity } from './scheduler-utils';

export interface DivisionScheduleConfig extends Omit<IntelligentConfig, 'teams'> {
  /** All teams enrolled in the league (with optional divisionId). */
  teams: (TeamIdentity & { divisionId?: string })[];
  /**
   * Raw divisions from the league document (handles both string[] and Division[]).
   * If empty or undefined, falls back to single-tier behaviour.
   */
  divisions?: string[] | Division[] | null;
  /**
   * When true, cross-division games are not generated.
   * When false (default), all teams are scheduled together.
   */
  separateByDivision?: boolean;
}

export interface DivisionScheduleResult {
  games: TournamentGame[];
  /** Map of divisionId → number of games scheduled for that division */
  divisionGameCounts: Record<string, number>;
}

/**
 * Generates a schedule for a league, with optional per-division partitioning.
 *
 * - If `separateByDivision` is true AND divisions exist AND teams have divisionId
 *   set, each division gets its own independent schedule and games are tagged
 *   with `divisionId`.
 * - Otherwise behaves exactly like `generateIntelligentLeagueSchedule`.
 */
export function generateDivisionAwareLeagueSchedule(
  config: DivisionScheduleConfig
): DivisionScheduleResult {
  const { teams, divisions: rawDivisions, separateByDivision = true, ...baseConfig } = config;
  const divisions = normalizeDivisions(rawDivisions);

  // ── Fallback: no divisions → standard flat schedule ────────────────────────
  if (!separateByDivision || divisions.length === 0) {
    const { games, report } = generateIntelligentLeagueSchedule({ ...baseConfig, teams });
    return { games, divisionGameCounts: {} };
  }

  // ── Division-aware: partition teams → schedule per division ────────────────
  const allGames: TournamentGame[] = [];
  const divisionGameCounts: Record<string, number> = {};

  for (const division of divisions) {
    // Find teams assigned to this division (support both id and legacy name match)
    const divisionTeams = teams.filter(t =>
      t.divisionId
        ? divisionMatchesFilter(t.divisionId, division.id)
        : divisionMatchesFilter((t as any).division, division.id)
    );

    if (divisionTeams.length < 2) {
      // Not enough teams for this division — skip scheduling but record the count
      divisionGameCounts[division.id] = 0;
      continue;
    }

    const { games } = generateIntelligentLeagueSchedule({
      ...baseConfig,
      teams: divisionTeams,
    });

    // Tag every game with the divisionId
    const taggedGames = games.map(game => ({
      ...game,
      divisionId: division.id,
    }));

    allGames.push(...taggedGames);
    divisionGameCounts[division.id] = taggedGames.length;
  }

  // ── Unassigned teams: schedule together without a divisionId ──────────────
  const unassignedTeams = teams.filter(t => {
    const assignedDivisionId = (t as any).divisionId || (t as any).division;
    return !assignedDivisionId || !divisions.some(d =>
      divisionMatchesFilter(assignedDivisionId, d.id)
    );
  });

  if (unassignedTeams.length >= 2) {
    const { games } = generateIntelligentLeagueSchedule({
      ...baseConfig,
      teams: unassignedTeams,
    });
    allGames.push(...games); // No divisionId tag — shows in all division contexts
  }

  return { games: allGames, divisionGameCounts };
}
