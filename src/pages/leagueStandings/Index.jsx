import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCompetitions } from '../../store/competitionsSlice';
import { getSeasons } from '../../store/seasons/seasonsSlice';
import {
  getLeagueStandings,
  recalculateLeagueStandings,
} from '../../store/leagueStandings/leagueStandingsSlice';
import { SEASON_STATUS_LABEL, seasonStatusOf } from '../../utils/seasonApi';

export default function LeagueStandingsIndex() {
  const dispatch = useDispatch();
  const { list = [], loading, recalculating, error } = useSelector(
    (s) => s.leagueStandings,
  );
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { list: seasons = [] } = useSelector((s) => s.seasons || {});
  const user = useSelector((s) => s.auth.user);
  const isLeagueStaff =
    user?.profile?.name === 'MANAGER_LEAGUE' ||
    user?.profile?.name === 'ASISTANT_LEAGUE';
  const canView =
    user?.profile?.name === 'ADMIN' ||
    user?.profile?.name === 'SUPER_ADMIN' ||
    isLeagueStaff;

  const [competitionId, setCompetitionId] = useState('');
  const [seasonId, setSeasonId] = useState('');

  useEffect(() => {
    if (canView) dispatch(getCompetitions());
  }, [dispatch, canView]);

  useEffect(() => {
    if (canView && competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, canView, competitionId]);

  useEffect(() => {
    if (competitionId) return;
    if (isLeagueStaff && user?.competitionId) {
      setCompetitionId(user.competitionId);
      return;
    }
    if (competitions.length === 1) {
      setCompetitionId(competitions[0].id);
    }
  }, [competitions, competitionId, isLeagueStaff, user?.competitionId]);

  useEffect(() => {
    if (seasons.length && !seasonId) {
      const active =
        seasons.find((s) => seasonStatusOf(s) === 'ACTIVE') ?? seasons[0];
      if (active) setSeasonId(active.id);
    }
  }, [seasons, seasonId]);

  useEffect(() => {
    if (canView && competitionId && seasonId) {
      dispatch(getLeagueStandings({ competitionId, seasonId }));
    }
  }, [dispatch, canView, competitionId, seasonId]);

  const lockedCompetition =
    competitions.find((c) => c.id === competitionId) ||
    (isLeagueStaff && competitions[0]) ||
    null;

  const teamNameById = useMemo(() => {
    const map = {};
    list.forEach((row) => {
      if (row.team?.name) map[row.teamId] = row.team.name;
    });
    return map;
  }, [list]);

  const handleRecalculate = () => {
    dispatch(recalculateLeagueStandings({ competitionId, seasonId }));
  };

  if (!canView) {
    return (
      <div className="container py-4">
        <p>No tienes permiso para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0">Tabla de posiciones</h4>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            disabled={!competitionId || !seasonId || recalculating}
            onClick={handleRecalculate}
          >
            {recalculating ? 'Recalculando…' : 'Recalcular'}
          </button>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Competición</label>
              {isLeagueStaff ? (
                <input
                  type="text"
                  className="form-control"
                  value={
                    lockedCompetition?.name ||
                    (competitionId ? 'Tu liga' : 'Cargando…')
                  }
                  disabled
                />
              ) : (
                <select
                  className="form-select"
                  value={competitionId}
                  onChange={(e) => {
                    setCompetitionId(e.target.value);
                    setSeasonId('');
                  }}
                >
                  <option value="">Seleccionar…</option>
                  {competitions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="col-md-6">
              <label className="form-label">Temporada</label>
              <select
                className="form-select"
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                disabled={!competitionId}
              >
                <option value="">Seleccionar…</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                    {SEASON_STATUS_LABEL[seasonStatusOf(s)]
                      ? ` (${SEASON_STATUS_LABEL[seasonStatusOf(s)].toLowerCase()})`
                      : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p>Cargando tabla…</p>}
          {error && (
            <div className="alert alert-danger">
              Error: {JSON.stringify(error)}
            </div>
          )}

          {!loading && competitionId && seasonId && list.length === 0 && (
            <p className="text-muted">
              Sin datos. Crea partidos de liga finalizados y pulsa Recalcular.
            </p>
          )}

          {list.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Equipo</th>
                    <th>PJ</th>
                    <th>PG</th>
                    <th>PP</th>
                    <th>PF</th>
                    <th>PC</th>
                    <th>PTS</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((row) => (
                    <tr key={row.id}>
                      <td>{row.position}</td>
                      <td>
                        {row.team?.name ?? teamNameById[row.teamId] ?? row.teamId}
                      </td>
                      <td>{row.played}</td>
                      <td>{row.wins}</td>
                      <td>{row.losses}</td>
                      <td>{row.pointsFor}</td>
                      <td>{row.pointsAgainst}</td>
                      <td>{row.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
