import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import { getCompetitions } from '../../store/competitionsSlice';
import { getLeagueGames } from '../../store/leagueGames/leagueGamesSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getUsers } from '../../store/usersSlice';
import { leagueMatchStatuses } from '../../utils/leagueMatchApi';
import {
  AlertsList,
  DashboardHeader,
  QuickLinks,
  SimpleTable,
  StatCards,
} from './DashboardShell';
import {
  formatDateTime,
  leagueMatchRivalLabel,
  pickUpcoming,
} from './helpers';

const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label || value || '—';

export default function AdminHome({ user }) {
  const dispatch = useDispatch();
  const { competitions = [], loading: loadingCompetitions } = useSelector(
    (s) => s.competitions || {},
  );
  const { countries = [], loading: loadingCountries } = useSelector(
    (s) => s.catalogCountries || {},
  );
  const { teams = [], loading: loadingTeams } = useSelector(
    (s) => s.teamsList || {},
  );
  const { pagination, loading: loadingUsers } = useSelector((s) => s.users || {});
  const { list: matches = [], loading: loadingMatches } = useSelector(
    (s) => s.leagueGames || {},
  );

  useEffect(() => {
    dispatch(getCompetitions());
    dispatch(getCatalogCountries());
    dispatch(getTeams());
    dispatch(getUsers({ page: 1, limit: 1 }));
    dispatch(getLeagueGames({}));
  }, [dispatch]);

  const activeCompetitions = competitions.filter((c) => c.isActive !== false);
  const activeTeams = teams.filter((t) => t.isActive !== false);
  const upcoming = useMemo(() => pickUpcoming(matches, 5), [matches]);

  const alerts = useMemo(() => {
    const list = [];
    const inactiveComps = competitions.filter((c) => c.isActive === false);
    if (inactiveComps.length) {
      list.push(`${inactiveComps.length} competencia(s) inactiva(s).`);
    }
    const noManager = competitions.filter(
      (c) => c.isActive !== false && !c.managerId && !c.userId,
    );
    if (noManager.length) {
      list.push(`${noManager.length} competencia(s) sin gerente asignado.`);
    }
    const withoutVenue = upcoming.filter((m) => !m.venue);
    if (withoutVenue.length) {
      list.push(`${withoutVenue.length} partido(s) próximo(s) sin sede.`);
    }
    return list;
  }, [competitions, upcoming]);

  const loading =
    loadingCompetitions ||
    loadingCountries ||
    loadingTeams ||
    loadingUsers ||
    loadingMatches;

  const teamNameById = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [teams]);

  return (
    <>
      <DashboardHeader user={user} contextLabel="Plataforma" loading={loading} />
      <StatCards
        items={[
          {
            label: 'Países',
            value: countries.length,
            icon: 'bi-geo-alt',
            color: 'primary',
          },
          {
            label: 'Competencias activas',
            value: activeCompetitions.length,
            hint: `${competitions.length} en total`,
            icon: 'bi-trophy',
            color: 'success',
          },
          {
            label: 'Equipos activos',
            value: activeTeams.length,
            hint: `${teams.length} en total`,
            icon: 'bi-people',
            color: 'info',
          },
          {
            label: 'Usuarios',
            value: pagination?.totalUsers ?? '—',
            icon: 'bi-person-badge',
            color: 'warning',
          },
        ]}
      />
      <QuickLinks
        links={[
          { to: '/competitions', label: 'Competencias', icon: 'bi-trophy' },
          { to: '/users', label: 'Usuarios', icon: 'bi-people' },
          { to: '/seasons', label: 'Temporadas', icon: 'bi-calendar-range' },
          { to: '/tickets/events', label: 'Eventos boletos', icon: 'bi-ticket-perforated' },
          { to: '/teams', label: 'Equipos', icon: 'bi-shield' },
        ]}
      />
      <AlertsList alerts={alerts} />
      <div className="row g-4">
        <div className="col-12">
          <SimpleTable
            title="Próximos partidos"
            emptyText="No hay partidos próximos"
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
      </div>
    </>
  );
}
