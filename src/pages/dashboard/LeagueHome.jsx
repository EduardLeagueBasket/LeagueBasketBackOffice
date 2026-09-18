import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCompetitions } from '../../store/competitionsSlice';
import { getLeagueGames } from '../../store/leagueGames/leagueGamesSlice';
import { getLeagueStandings } from '../../store/leagueStandings/leagueStandingsSlice';
import {
  getSeasonTeams,
  getSeasons,
} from '../../store/seasons/seasonsSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { leagueMatchStatuses } from '../../utils/leagueMatchApi';
import { SEASON_STATUS_LABEL, seasonStatusOf } from '../../utils/seasonApi';
import {
  AlertsList,
  DashboardHeader,
  QuickLinks,
  SimpleTable,
  StatCards,
} from './DashboardShell';
import {
  findActiveSeason,
  formatDateTime,
  leagueMatchRivalLabel,
  pickUpcoming,
} from './helpers';

const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label || value || '—';

export default function LeagueHome({ user }) {
  const dispatch = useDispatch();
  const competitionId = user?.competitionId;
  const { competitions = [], loading: loadingCompetitions } = useSelector(
    (s) => s.competitions || {},
  );
  const { list: seasons = [], seasonTeams = [], loading: loadingSeasons, teamsLoading } =
    useSelector((s) => s.seasons || {});
  const { teams = [], loading: loadingTeams } = useSelector(
    (s) => s.teamsList || {},
  );
  const { list: matches = [], loading: loadingMatches } = useSelector(
    (s) => s.leagueGames || {},
  );
  const { list: standings = [], loading: loadingStandings } = useSelector(
    (s) => s.leagueStandings || {},
  );

  useEffect(() => {
    dispatch(getCompetitions());
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    if (competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, competitionId]);

  const focusSeason = useMemo(() => findActiveSeason(seasons), [seasons]);

  useEffect(() => {
    if (!competitionId) return;
    if (focusSeason?.id) {
      dispatch(getSeasonTeams(focusSeason.id));
      dispatch(
        getLeagueGames({ competitionId, seasonId: focusSeason.id }),
      );
      dispatch(
        getLeagueStandings({
          competitionId,
          seasonId: focusSeason.id,
        }),
      );
      return;
    }
    dispatch(getLeagueGames({ competitionId }));
  }, [dispatch, competitionId, focusSeason?.id]);

  const competition =
    competitions.find((c) => c.id === competitionId) || competitions[0];
  const leagueTeams = useMemo(
    () => teams.filter((t) => t.competitionId === competitionId),
    [teams, competitionId],
  );
  const enrolledCount = seasonTeams.length;
  const upcoming = useMemo(() => pickUpcoming(matches, 5), [matches]);
  const withoutScore = matches.filter(
    (m) =>
      String(m.status).toUpperCase() === 'FINISHED' &&
      (m.homeScore == null || m.awayScore == null),
  );
  const topStandings = useMemo(() => {
    return [...standings]
      .sort(
        (a, b) =>
          (a.position ?? a.rank ?? 999) - (b.position ?? b.rank ?? 999),
      )
      .slice(0, 5);
  }, [standings]);

  const teamNameById = useMemo(() => {
    const map = {};
    leagueTeams.forEach((t) => {
      map[t.id] = t.name;
    });
    seasonTeams.forEach((st) => {
      if (st.team?.name) map[st.teamId || st.team.id] = st.team.name;
    });
    standings.forEach((row) => {
      if (row.team?.name) map[row.teamId] = row.team.name;
    });
    return map;
  }, [leagueTeams, seasonTeams, standings]);

  const alerts = useMemo(() => {
    const list = [];
    if (!competitionId) {
      list.push('Tu usuario no tiene competencia asignada.');
      return list;
    }
    if (!seasons.length) {
      list.push('Aún no hay temporadas creadas para tu liga.');
    }
    const active = seasons.find((s) => seasonStatusOf(s) === 'ACTIVE');
    if (!active) {
      list.push('No hay temporada ACTIVE. Activa una para jugar el torneo.');
    } else if (enrolledCount === 0) {
      list.push(`La temporada «${active.name}» no tiene equipos inscritos.`);
    }
    const noVenue = upcoming.filter((m) => !m.venue);
    if (noVenue.length) {
      list.push(`${noVenue.length} partido(s) próximo(s) sin sede.`);
    }
    if (withoutScore.length) {
      list.push(`${withoutScore.length} partido(s) finalizado(s) sin marcador.`);
    }
    return list;
  }, [competitionId, seasons, enrolledCount, upcoming, withoutScore.length]);

  const loading =
    loadingCompetitions ||
    loadingSeasons ||
    loadingTeams ||
    loadingMatches ||
    teamsLoading ||
    loadingStandings;

  return (
    <>
      <DashboardHeader
        user={user}
        contextLabel={competition?.name || 'Tu liga'}
        loading={loading}
      />
      <StatCards
        items={[
          {
            label: 'Temporada',
            value: focusSeason?.name || '—',
            hint: focusSeason
              ? SEASON_STATUS_LABEL[seasonStatusOf(focusSeason)]
              : 'Sin temporada',
            icon: 'bi-calendar-range',
            color: 'primary',
          },
          {
            label: 'Equipos inscritos',
            value: enrolledCount,
            hint: `${leagueTeams.length} en la liga`,
            icon: 'bi-people',
            color: 'success',
          },
          {
            label: 'Próximos partidos',
            value: upcoming.length,
            icon: 'bi-calendar2-week',
            color: 'info',
          },
          {
            label: 'Sin marcador',
            value: withoutScore.length,
            icon: 'bi-exclamation-circle',
            color: 'warning',
          },
        ]}
      />
      <QuickLinks
        links={[
          { to: '/seasons', label: 'Temporadas', icon: 'bi-calendar-range' },
          ...(focusSeason?.id
            ? [
                {
                  to: `/seasons/${focusSeason.id}`,
                  label: 'Inscribir equipos',
                  icon: 'bi-person-plus',
                },
              ]
            : []),
          { to: '/league-games/bulk', label: 'Carga masiva', icon: 'bi-upload' },
          { to: '/league-standings', label: 'Tabla', icon: 'bi-bar-chart-steps' },
          { to: '/users', label: 'Usuarios', icon: 'bi-people' },
          { to: '/league-games', label: 'Partidos', icon: 'bi-calendar2-week' },
        ]}
      />
      <AlertsList alerts={alerts} />
      <div className="row g-4">
        <div className="col-lg-7">
          <SimpleTable
            title="Próximos partidos"
            emptyText="No hay partidos próximos en esta temporada"
            columns={[
              { key: 'when', label: 'Fecha', className: 'ps-4' },
              { key: 'match', label: 'Partido' },
              { key: 'status', label: 'Estado', className: 'pe-4' },
            ]}
            rows={upcoming.map((m) => ({
              id: m.id,
              when: formatDateTime(m.matchDate),
              match: leagueMatchRivalLabel(m, teamNameById),
              status: labelOf(leagueMatchStatuses, m.status),
            }))}
          />
        </div>
        <div className="col-lg-5">
          <SimpleTable
            title="Top 5 tabla"
            emptyText="Sin posiciones todavía"
            columns={[
              { key: 'pos', label: '#', className: 'ps-4' },
              { key: 'team', label: 'Equipo' },
              { key: 'pts', label: 'Pts', className: 'pe-4' },
            ]}
            rows={topStandings.map((row, i) => ({
              id: row.teamId || row.id || i,
              pos: row.position ?? row.rank ?? i + 1,
              team: row.team?.name || teamNameById[row.teamId] || row.teamId,
              pts: row.points ?? row.pts ?? 0,
            }))}
          />
        </div>
      </div>
    </>
  );
}
