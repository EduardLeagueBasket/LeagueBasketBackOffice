import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCompetitions } from '../../store/competitionsSlice';
import {
  activateSeason,
  getSeasons,
} from '../../store/seasons/seasonsSlice';

export default function SeasonsIndex() {
  const dispatch = useDispatch();
  const { list = [], loading, error } = useSelector((s) => s.seasons);
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const user = useSelector((s) => s.auth.user);
  const isAdmin =
    user?.profile?.name === 'ADMIN' || user?.profile?.name === 'SUPER_ADMIN';

  const [competitionId, setCompetitionId] = useState('');

  useEffect(() => {
    if (isAdmin) dispatch(getCompetitions());
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, isAdmin, competitionId]);

  const handleActivate = (season) => {
    dispatch(activateSeason({ id: season.id, competitionId })).then(() => {
      dispatch(getSeasons({ competitionId }));
    });
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
          <h4 className="mb-0">Temporadas</h4>
          <ButtonNavigation
            url="/seasons/add"
            icon="bi bi-plus-lg"
            text="Nueva temporada"
          />
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Competición</label>
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
                    <th>Activa</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((season) => (
                    <tr key={season.id}>
                      <td>{season.name}</td>
                      <td>
                        {season.startDate
                          ? new Date(season.startDate).toLocaleDateString('es-ES')
                          : '—'}
                      </td>
                      <td>
                        {season.endDate
                          ? new Date(season.endDate).toLocaleDateString('es-ES')
                          : '—'}
                      </td>
                      <td>
                        {season.isActive ? (
                          <span className="badge bg-success">Activa</span>
                        ) : (
                          <span className="badge bg-secondary">Inactiva</span>
                        )}
                      </td>
                      <td>
                        {!season.isActive && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleActivate(season)}
                          >
                            Activar
                          </button>
                        )}
                      </td>
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
