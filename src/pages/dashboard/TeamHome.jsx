import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getManagerLeagueGames } from '../../store/leagueGames/managerLeagueGamesSlice';
import { getLeagueStandings } from '../../store/leagueStandings/leagueStandingsSlice';
import { getSeasons } from '../../store/seasons/seasonsSlice';
import { getTeamByManager } from '../../store/teams/getTeamSlice';
import { leagueMatchStatuses } from '../../utils/leagueMatchApi';
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
  leagueScoreLabel,
  pickRecentResults,
  pickUpcoming,
  standingPositionForTeam,
} from './helpers';

const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label || value || '—';

export default function TeamHome({ user }) {
  const dispatch = useDispatch();
  const { team = {}, loading: loadingTeam } = useSelector((s) => s.team || {});
  const { list: matches = [], loading: loadingMatches } = useSelector(
    (s) => s.managerLeagueGames || {},
  );
  const { list: seasons = [], loading: loadingSeasons } = useSelector(
    (s) => s.seasons || {},
  );
  const { list: standings = [], loading: loadingStandings } = useSelector(
    (s) => s.leagueStandings || {},
  );

  useEffect(() => {
    dispatch(getTeamByManager());
    dispatch(getManagerLeagueGames());
  }, [dispatch]);

  useEffect(() => {
    if (team?.competitionId) {
      dispatch(getSeasons({ competitionId: team.competitionId }));
    }
  }, [dispatch, team?.competitionId]);

  const activeSeason = useMemo(() => findActiveSeason(seasons), [seasons]);

  useEffect(() => {
    if (team?.competitionId && activeSeason?.id) {
      dispatch(
        getLeagueStandings({
          competitionId: team.competitionId,
          seasonId: activeSeason.id,
        }),
      );
    }
  }, [dispatch, team?.competitionId, activeSeason?.id]);

  const upcoming = useMemo(() => pickUpcoming(matches, 5), [matches]);
  const recent = useMemo(() => pickRecentResults(matches, 5), [matches]);
  const position = standingPositionForTeam(standings, team?.id);

  const alerts = useMemo(() => {
    const list = [];
    if (!team?.id) {
      list.push('No tienes un equipo asignado.');
      return list;
    }
    if (user?.requiredChangePassword) {
      list.push('Debes actualizar tu contraseña.');
    }
    if (team.isActive === false) {
      list.push('Tu equipo está inactivo.');
    }
    if (!upcoming.length) {
      list.push('No hay partidos próximos registrados.');
    }
    return list;
  }, [team, user?.requiredChangePassword, upcoming.length]);

  const loading =
    loadingTeam || loadingMatches || loadingSeasons || loadingStandings;

  return (
    <>
      <DashboardHeader
        user={user}
        contextLabel={team?.name || 'Tu equipo'}
        loading={loading}
      />
      <StatCards
        items={[
          {
            label: 'Equipo',
            value: team?.name || '—',
            hint: team?.sellsTickets ? 'Vende boletos' : 'Sin boletos',
            icon: 'bi-shield',
            color: 'primary',
          },
          {
            label: 'Posición',
            value: position ?? '—',
            hint: activeSeason?.name || 'Sin temporada activa',
            icon: 'bi-bar-chart-steps',
            color: 'success',
          },
          {
            label: 'Próximos',
            value: upcoming.length,
            icon: 'bi-calendar2-week',
            color: 'info',
          },
          {
            label: 'Últimos resultados',
            value: recent.length,
            icon: 'bi-flag',
            color: 'warning',
          },
        ]}
      />
      <QuickLinks
        links={[
          { to: '/teams/manager', label: 'Mi equipo', icon: 'bi-gear' },
          { to: '/league-games/manager', label: 'Mis partidos', icon: 'bi-calendar-plus' },
          { to: '/stories', label: 'Stories', icon: 'bi-camera-reels' },
        ]}
      />
      <AlertsList alerts={alerts} />
      <div className="row g-4">
        <div className="col-lg-6">
          <SimpleTable
            title="Próximos partidos"
            emptyText="Sin partidos próximos"
            columns={[
              { key: 'when', label: 'Fecha', className: 'ps-4' },
              { key: 'match', label: 'Partido' },
              { key: 'status', label: 'Estado', className: 'pe-4' },
            ]}
            rows={upcoming.map((m) => ({
              id: m.id,
              when: formatDateTime(m.matchDate),
              match: leagueMatchRivalLabel(m),
              status: labelOf(leagueMatchStatuses, m.status),
            }))}
          />
        </div>
        <div className="col-lg-6">
          <SimpleTable
            title="Últimos resultados"
            emptyText="Sin resultados recientes"
            columns={[
              { key: 'when', label: 'Fecha', className: 'ps-4' },
              { key: 'match', label: 'Partido' },
              { key: 'score', label: 'Marcador', className: 'pe-4' },
            ]}
            rows={recent.map((m) => ({
              id: m.id,
              when: formatDateTime(m.matchDate),
              match: leagueMatchRivalLabel(m),
              score: leagueScoreLabel(m),
            }))}
          />
        </div>
      </div>
    </>
  );
}
