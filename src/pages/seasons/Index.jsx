import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCompetitions } from '../../store/competitionsSlice';
import {
  activateSeason,
  completeSeason,
  getSeasons,
} from '../../store/seasons/seasonsSlice';
import {
  SEASON_STATUS,
  SEASON_STATUS_LABEL,
  seasonStatusOf,
} from '../../utils/seasonApi';

function statusBadgeClass(status) {
  if (status === SEASON_STATUS.ACTIVE) return 'bg-success';
  if (status === SEASON_STATUS.PENDING) return 'bg-warning text-dark';
  return 'bg-secondary';
}

export default function SeasonsIndex() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list = [], loading, error } = useSelector((s) => s.seasons);
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const user = useSelector((s) => s.auth.user);
  const isLeagueStaff =
    user?.profile?.name === 'MANAGER_LEAGUE' ||
    user?.profile?.name === 'ASISTANT_LEAGUE';
  const canManage =
    user?.profile?.name === 'ADMIN' ||
    user?.profile?.name === 'SUPER_ADMIN' ||
    user?.profile?.name === 'MANAGER_LEAGUE';

  const [competitionId, setCompetitionId] = useState('');

  useEffect(() => {
    if (canManage) dispatch(getCompetitions());
  }, [dispatch, canManage]);

  useEffect(() => {
    if (canManage && competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, canManage, competitionId]);

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

  const lockedCompetition =
    competitions.find((c) => c.id === competitionId) ||
    (isLeagueStaff && competitions[0]) ||
    null;

  const refresh = () => {
    if (competitionId) dispatch(getSeasons({ competitionId }));
  };

  const handleActivate = async (season) => {
    await dispatch(activateSeason({ id: season.id, competitionId }));
    refresh();
  };

  const handleComplete = async (season) => {
    await dispatch(completeSeason({ id: season.id, competitionId }));
    refresh();
  };

  if (!canManage) {
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
          <h4 className="mb-0">Temporadas / ediciones</h4>
          <ButtonNavigation
            url="/seasons/add"
            icon="bi bi-plus-lg"
            text="Nueva temporada"
          />
        </div>
        <div className="card-body">
          <p className="text-muted small">
            Cada temporada es una edición independiente (ej. 2025-2026). Los
            partidos, la tabla y los equipos inscritos quedan ligados a esa
            edición; no hace falta editar la competencia del catálogo.
          </p>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Competición</label>
              {isLeagueStaff ? (
                <>
                  <input
                    type="text"
                    className="form-control"
                    value={
                      lockedCompetition?.name ||
                      (competitionId ? 'Tu liga' : 'Cargando…')
                    }
                    disabled
                  />
                  <small className="text-muted">
                    Como gerente de liga solo administras tu competencia.
                  </small>
                </>
              ) : (
                <select
                  className="form-select"
                  value={competitionId}
                  onChange={(e) => setCompetitionId(e.target.value)}
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
          </div>

          {loading && <p>Cargando temporadas…</p>}
          {error && (
            <div className="alert alert-danger">
              Error: {JSON.stringify(error)}
            </div>
          )}

          {!loading && competitionId && list.length === 0 && (
            <p className="text-muted">
              No hay temporadas.{' '}
              <Link to="/seasons/add">Crear la primera</Link>
            </p>
          )}

          {list.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Inicio</th>
                    <th>Fin</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((season) => {
                    const status = seasonStatusOf(season);
                    return (
                      <tr key={season.id}>
                        <td>{season.name}</td>
                        <td>
                          {season.startDate
                            ? new Date(season.startDate).toLocaleDateString(
                                'es-ES',
                              )
                            : '—'}
                        </td>
                        <td>
                          {season.endDate
                            ? new Date(season.endDate).toLocaleDateString(
                                'es-ES',
                              )
                            : '—'}
                        </td>
                        <td>
                          <span
                            className={`badge ${statusBadgeClass(status)}`}
                          >
                            {SEASON_STATUS_LABEL[status] || status}
                          </span>
                        </td>
                        <td className="text-end">
                          <div className="d-flex gap-2 justify-content-end flex-wrap">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() =>
                                navigate(`/seasons/${season.id}`, {
                                  state: { competitionId, season },
                                })
                              }
                            >
                              Equipos
                            </button>
                            {status !== SEASON_STATUS.ACTIVE && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => handleActivate(season)}
                              >
                                Activar
                              </button>
                            )}
                            {status === SEASON_STATUS.ACTIVE && (
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-dark"
                                onClick={() => handleComplete(season)}
                              >
                                Finalizar
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
