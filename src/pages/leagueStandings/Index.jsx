import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getCompetitions } from '../../store/competitionsSlice';
import { getSeasons } from '../../store/seasons/seasonsSlice';
import {
  getLeagueStandings,
  recalculateLeagueStandings,
} from '../../store/leagueStandings/leagueStandingsSlice';

export default function LeagueStandingsIndex() {
  const dispatch = useDispatch();
  const { list = [], loading, recalculating, error } = useSelector(
    (s) => s.leagueStandings,
  );
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { list: seasons = [] } = useSelector((s) => s.seasons || {});
  const user = useSelector((s) => s.auth.user);
  const isAdmin =
    user?.profile?.name === 'ADMIN' || user?.profile?.name === 'SUPER_ADMIN';

  const [competitionId, setCompetitionId] = useState('');
  const [seasonId, setSeasonId] = useState('');

  useEffect(() => {
    if (isAdmin) dispatch(getCompetitions());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, isAdmin, competitionId]);

  useEffect(() => {
    if (seasons.length && !seasonId) {
      const active = seasons.find((s) => s.isActive) ?? seasons[0];
      if (active) setSeasonId(active.id);
    }
  }, [seasons, seasonId]);

  useEffect(() => {
    if (isAdmin && competitionId && seasonId) {
      dispatch(getLeagueStandings({ competitionId, seasonId }));
    }
  }, [dispatch, isAdmin, competitionId, seasonId]);

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

  if (!isAdmin) {
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
                    {s.isActive ? ' (activa)' : ''}
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
