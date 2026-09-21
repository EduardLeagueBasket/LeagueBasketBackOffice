import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getNationalGames } from '../../store/nationalGames/getNationalGamesSlice';
import { getMyNationalTeam } from '../../store/nationalTeams/getMyNationalTeamSlice';
import {
  AlertsList,
  DashboardHeader,
  QuickLinks,
  SimpleTable,
  StatCards,
} from './DashboardShell';
import {
  formatDateTime,
  isFinishedMatch,
  isUpcomingMatch,
  nationalMatchLabel,
  nationalScoreLabel,
  pickRecentResults,
  pickUpcoming,
} from './helpers';

export default function NationalHome({ user }) {
  const dispatch = useDispatch();
  const isRegionalStaff =
    user?.profile?.name === 'MANAGER_REGIONAL_TEAM' ||
    user?.profile?.name === 'ASISTANT_REGIONAL_TEAM';
  const { myNationalTeam, loading: loadingTeam } = useSelector(
    (s) => s.myNationalTeam || {},
  );
  const { nationalGames = [], loading: loadingGames } = useSelector(
    (s) => s.nationalGames || {},
  );

  useEffect(() => {
    dispatch(getMyNationalTeam());
    dispatch(getNationalGames());
  }, [dispatch]);

  const team = myNationalTeam?.data || myNationalTeam;
  const myGames = useMemo(() => {
    if (!team?.id) return nationalGames;
    return nationalGames.filter(
      (g) => g.nationalTeamId === team.id || g.nationalTeam?.id === team.id,
    );
  }, [nationalGames, team?.id]);

  const upcoming = useMemo(() => pickUpcoming(myGames, 5), [myGames]);
  const recent = useMemo(() => pickRecentResults(myGames, 5), [myGames]);
  const scheduledCount = myGames.filter((g) => isUpcomingMatch(g)).length;
  const finishedCount = myGames.filter((g) => isFinishedMatch(g)).length;

  const contextLabel = [team?.name, team?.countryName || team?.country?.name]
    .filter(Boolean)
    .join(' · ');

  const alerts = useMemo(() => {
    const list = [];
    if (!team?.id) {
      list.push(
        isRegionalStaff
          ? 'No tienes un equipo regional asignado.'
          : 'No tienes una selección nacional asignada.',
      );
      return list;
    }
    if (user?.requiredChangePassword) {
      list.push('Debes actualizar tu contraseña.');
    }
    if (!upcoming.length) {
      list.push(
        isRegionalStaff
          ? 'No hay juegos regionales próximos.'
          : 'No hay juegos nacionales próximos.',
      );
    }
    return list;
  }, [team?.id, user?.requiredChangePassword, upcoming.length, isRegionalStaff]);

  const loading = loadingTeam || loadingGames;

  return (
    <>
      <DashboardHeader
        user={user}
        contextLabel={contextLabel || (isRegionalStaff ? 'Equipo regional' : 'Selección nacional')}
        loading={loading}
      />
      <StatCards
        items={[
          {
            label: isRegionalStaff ? 'Equipo' : 'Selección',
            value: team?.name || '—',
            hint: team?.category || team?.gender || undefined,
            icon: 'bi-flag',
            color: 'primary',
          },
          {
            label: 'Próximos juegos',
            value: scheduledCount,
            icon: 'bi-calendar-event',
            color: 'info',
          },
          {
            label: 'Finalizados',
            value: finishedCount,
            icon: 'bi-check2-circle',
            color: 'success',
          },
          {
            label: 'País',
            value: team?.countryName || team?.country?.name || team?.countryCode || '—',
            icon: 'bi-geo-alt',
            color: 'warning',
          },
        ]}
      />
      <QuickLinks
        links={[
          {
            to: '/national-teams/manager',
            label: isRegionalStaff ? 'Equipo regional' : 'Equipo nacional',
            icon: 'bi-gear',
          },
          {
            to: '/national-games',
            label: isRegionalStaff ? 'Juegos regionales' : 'Juegos nacionales',
            icon: 'bi-calendar-event',
          },
          { to: '/stories', label: 'Stories', icon: 'bi-camera-reels' },
        ]}
      />
      <AlertsList alerts={alerts} />
      <div className="row g-4">
        <div className="col-lg-6">
          <SimpleTable
            title="Próximos juegos"
            emptyText="Sin juegos próximos"
            columns={[
              { key: 'when', label: 'Fecha', className: 'ps-4' },
              { key: 'match', label: 'Rival' },
              { key: 'venue', label: 'Sede', className: 'pe-4' },
            ]}
            rows={upcoming.map((m) => ({
              id: m.id,
              when: formatDateTime(m.matchDate || m.gameDate),
              match: nationalMatchLabel(m),
              venue: m.venue || m.location || '—',
            }))}
          />
        </div>
        <div className="col-lg-6">
          <SimpleTable
            title="Últimos resultados"
            emptyText="Sin resultados recientes"
            columns={[
              { key: 'when', label: 'Fecha', className: 'ps-4' },
              { key: 'match', label: 'Rival' },
              { key: 'score', label: 'Marcador', className: 'pe-4' },
            ]}
            rows={recent.map((m) => ({
              id: m.id,
              when: formatDateTime(m.matchDate || m.gameDate),
              match: nationalMatchLabel(m),
              score: nationalScoreLabel(m),
            }))}
          />
        </div>
      </div>
    </>
  );
}
