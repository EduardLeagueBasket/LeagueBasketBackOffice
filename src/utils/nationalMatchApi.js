/** Rutas y mapeo al API `national-teams/matches` del gateway. */

/** Base admin para partidos de selecciones (`/api/admin/...`). */
export const NATIONAL_MATCHES_API_PATH = '/admin/national-teams/matches';

export function normalizeNationalMatchFromApi(raw) {
  if (!raw) return null;
  const matchDate = raw.matchDate ?? raw.gameDate;
  const nt = raw.nationalTeam;
  return {
    ...raw,
    matchDate,
    gameDate: matchDate,
    venue: raw.venue ?? null,
    location: raw.venue ?? '',
    competitionName: raw.competitionName ?? null,
    gameType: raw.competitionName ?? '',
    nationalTeam: nt
      ? {
          ...nt,
          logoUrl: nt.logo ?? nt.logoUrl,
        }
      : null,
  };
}

export function normalizeNationalMatchesList(data) {
  const list = Array.isArray(data)
    ? data
    : Array.isArray(data?.data)
      ? data.data
      : [];
  return list.map(normalizeNationalMatchFromApi);
}

export function buildCreateNationalMatchBody({
  nationalTeamId,
  opponentName,
  matchDateIso,
  venue,
  competitionName,
  status = 'scheduled',
}) {
  return {
    nationalTeamId,
    opponentName: opponentName.trim(),
    matchDate: matchDateIso,
    venue: venue?.trim() ? venue.trim() : undefined,
    competitionName: competitionName || undefined,
    status,
  };
}

export function buildUpdateNationalMatchBody({
  nationalTeamId,
  opponentName,
  matchDateIso,
  venue,
  competitionName,
  status,
  homeScore,
  awayScore,
}) {
  const body = {};
  if (nationalTeamId !== undefined) body.nationalTeamId = nationalTeamId;
  if (opponentName !== undefined) body.opponentName = opponentName.trim();
  if (matchDateIso !== undefined) body.matchDate = matchDateIso;
  if (venue !== undefined) body.venue = venue?.trim() ? venue.trim() : null;
  if (competitionName !== undefined) {
    body.competitionName = competitionName || null;
  }
  if (status !== undefined) body.status = status;
  if (homeScore !== undefined) body.homeScore = homeScore;
  if (awayScore !== undefined) body.awayScore = awayScore;
  return body;
}

/** Partidos que el admin puede cancelar (no finalizados ni ya cancelados). */
export function canCancelNationalMatch(match) {
  return match?.status === 'scheduled' || match?.status === 'live';
}

function parseMatchTime(m) {
  return new Date(m.matchDate ?? m.gameDate).getTime();
}

export function startOfLocalDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x.getTime();
}

function isUpcomingMatch(m, sod) {
  const t = parseMatchTime(m);
  if (m.status === 'live') return true;
  if (m.status === 'scheduled') return t >= sod;
  return false;
}

export function filterAndSortNationalMatches(list, filterKey) {
  const sod = startOfLocalDay(new Date());
  const asc = (a, b) => parseMatchTime(a) - parseMatchTime(b);
  const desc = (a, b) => parseMatchTime(b) - parseMatchTime(a);

  let filtered;
  switch (filterKey) {
    case 'upcoming':
      filtered = list.filter((m) => isUpcomingMatch(m, sod));
      return [...filtered].sort(asc);
    case 'live':
      filtered = list.filter((m) => m.status === 'live');
      return [...filtered].sort(asc);
    case 'finished':
      filtered = list.filter((m) => m.status === 'finished');
      return [...filtered].sort(desc);
    case 'cancelled':
      filtered = list.filter((m) => m.status === 'cancelled');
      return [...filtered].sort(desc);
    case 'all':
    default: {
      const arr = [...list];
      return arr.sort((a, b) => {
        const orderRank = (m) => {
          const t = parseMatchTime(m);
          if (m.status === 'live') return 0;
          if (m.status === 'scheduled' && t >= sod) return 1;
          if (m.status === 'finished') return 2;
          if (m.status === 'cancelled') return 4;
          return 3;
        };
        const ra = orderRank(a);
        const rb = orderRank(b);
        if (ra !== rb) return ra - rb;
        if (ra === 1 || ra === 0) return asc(a, b);
        return desc(a, b);
      });
    }
  }
}
