/** API de partidos de liga (`/api/admin/engine/matches`). */

export const LEAGUE_MATCHES_API = '/admin/engine/matches';
export const MANAGER_LEAGUE_MATCHES_API = '/admin/engine/my-matches';

export const leagueMatchTypes = [
  { value: 'LEAGUE', label: 'Liga' },
  { value: 'FRIENDLY', label: 'Amistoso' },
  { value: 'TOURNAMENT', label: 'Torneo' },
  { value: 'INTERNATIONAL', label: 'Internacional' },
];

export const leagueMatchStatuses = [
  { value: 'SCHEDULED', label: 'Programado' },
  { value: 'LIVE', label: 'En vivo' },
  { value: 'FINISHED', label: 'Finalizado' },
  { value: 'POSTPONED', label: 'Pospuesto' },
];

export function normalizeLeagueMatchesList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export function buildCreateLeagueMatchBody({
  competitionId,
  seasonId,
  homeTeamId,
  awayTeamId,
  awayTeamName,
  matchType,
  matchDateIso,
  status,
  venue,
}) {
  const body = {
    competitionId,
    homeTeamId,
    matchType: matchType || 'LEAGUE',
    matchDate: matchDateIso,
    status: status || 'SCHEDULED',
  };
  if (seasonId) body.seasonId = seasonId;
  if (awayTeamId) body.awayTeamId = awayTeamId;
  if (awayTeamName) body.awayTeamName = awayTeamName;
  if (venue) body.venue = venue;
  return body;
}

export function buildBulkLeagueMatchesBody({ competitionId, seasonId, matches }) {
  return {
    competitionId,
    seasonId: seasonId || undefined,
    matches: matches.map((m) => ({
      homeTeamId: m.homeTeamId,
      awayTeamId: m.awayTeamId || undefined,
      awayTeamName: m.awayTeamName || undefined,
      matchType: m.matchType || 'LEAGUE',
      matchDate: m.matchDateIso,
      status: m.status || 'SCHEDULED',
      venue: m.venue || undefined,
    })),
  };
}
