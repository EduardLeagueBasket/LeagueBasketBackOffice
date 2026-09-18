import { mapProfileName } from '../../utils/MapRoleName';
import { seasonStatusOf } from '../../utils/seasonApi';

export function userDisplayName(user) {
  if (!user) return 'Usuario';
  const full = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
  return full || user.email || 'Usuario';
}

export function userRoleLabel(user) {
  return mapProfileName(user?.profile?.name) || user?.profile?.name || '—';
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function isUpcomingMatch(match, now = new Date()) {
  const status = String(match?.status || '').toUpperCase();
  if (['FINISHED', 'CANCELLED', 'POSTPONED'].includes(status)) return false;
  const date = new Date(match?.matchDate || match?.gameDate);
  if (Number.isNaN(date.getTime())) {
    return status === 'SCHEDULED' || status === 'LIVE';
  }
  return date >= new Date(now.getTime() - 60 * 60 * 1000);
}

export function isFinishedMatch(match) {
  return String(match?.status || '').toUpperCase() === 'FINISHED';
}

export function sortByMatchDateAsc(a, b) {
  return new Date(a.matchDate || a.gameDate) - new Date(b.matchDate || b.gameDate);
}

export function sortByMatchDateDesc(a, b) {
  return new Date(b.matchDate || b.gameDate) - new Date(a.matchDate || a.gameDate);
}

export function pickUpcoming(matches, limit = 5) {
  return [...(matches || [])]
    .filter((m) => isUpcomingMatch(m))
    .sort(sortByMatchDateAsc)
    .slice(0, limit);
}

export function pickRecentResults(matches, limit = 5) {
  return [...(matches || [])]
    .filter((m) => isFinishedMatch(m))
    .sort(sortByMatchDateDesc)
    .slice(0, limit);
}

export function leagueMatchRivalLabel(match, teamNameById = {}) {
  const home =
    match?.homeTeam?.name ??
    teamNameById[match?.homeTeamId] ??
    match?.homeTeamId ??
    'Local';
  const away =
    match?.awayTeam?.name ??
    match?.awayTeamName ??
    teamNameById[match?.awayTeamId] ??
    'Visitante';
  return `${home} vs ${away}`;
}

export function leagueScoreLabel(match) {
  if (match?.homeScore == null || match?.awayScore == null) return '—';
  return `${match.homeScore} - ${match.awayScore}`;
}

export function nationalMatchLabel(match) {
  const opponent = match?.opponentName || 'Rival';
  return `vs ${opponent}`;
}

export function nationalScoreLabel(match) {
  if (match?.homeScore == null || match?.awayScore == null) return '—';
  return `${match.homeScore} - ${match.awayScore}`;
}

export function findActiveSeason(seasons = []) {
  return (
    seasons.find((s) => seasonStatusOf(s) === 'ACTIVE') ||
    seasons.find((s) => seasonStatusOf(s) === 'PENDING') ||
    null
  );
}

export function standingPositionForTeam(standings = [], teamId) {
  if (!teamId) return null;
  const sorted = [...standings].sort(
    (a, b) => (a.position ?? a.rank ?? 999) - (b.position ?? b.rank ?? 999),
  );
  const idx = sorted.findIndex((row) => row.teamId === teamId || row.team?.id === teamId);
  if (idx < 0) return null;
  return sorted[idx].position ?? sorted[idx].rank ?? idx + 1;
}
