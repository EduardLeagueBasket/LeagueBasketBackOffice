import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCompetitions } from '../../store/competitionsSlice';
import { createSeason } from '../../store/seasons/seasonsSlice';
import { SEASON_STATUS, SEASON_STATUS_LABEL } from '../../utils/seasonApi';

export default function SeasonAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { saving, error } = useSelector((s) => s.seasons);
  const user = useSelector((s) => s.auth.user);
  const isLeagueStaff =
    user?.profile?.name === 'MANAGER_LEAGUE' ||
    user?.profile?.name === 'ASISTANT_LEAGUE';
  const canManage =
    user?.profile?.name === 'ADMIN' ||
    user?.profile?.name === 'SUPER_ADMIN' ||
    user?.profile?.name === 'MANAGER_LEAGUE';

  const [form, setForm] = useState({
    name: '',
    competitionId: '',
    startDate: '',
    endDate: '',
    status: SEASON_STATUS.PENDING,
  });

  useEffect(() => {
    if (canManage) dispatch(getCompetitions());
  }, [dispatch, canManage]);

  useEffect(() => {
    if (form.competitionId) return;
    if (isLeagueStaff && user?.competitionId) {
      setForm((prev) => ({ ...prev, competitionId: user.competitionId }));
      return;
    }
    if (competitions.length === 1) {
      setForm((prev) => ({ ...prev, competitionId: competitions[0].id }));
    }
  }, [competitions, form.competitionId, isLeagueStaff, user?.competitionId]);

  const lockedCompetition =
    competitions.find((c) => c.id === form.competitionId) ||
    (isLeagueStaff && competitions[0]) ||
    null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSeason(form));
    if (createSeason.fulfilled.match(result)) {
      const season = result.payload;
      navigate(`/seasons/${season.id}`, {
        state: { competitionId: form.competitionId, season },
      });
    }
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
        <div className="card-header">
          <h4 className="mb-0">Nueva temporada</h4>
        </div>
        <div className="card-body">
          <p className="text-muted small">
            Crea una edición nueva (ej. 2026-2027) sin modificar temporadas
            anteriores. Luego podrás inscribir los equipos que participan.
          </p>
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="2026-2027"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Competición</label>
                {isLeagueStaff ? (
                  <>
                    <input
                      type="text"
                      className="form-control"
                      value={
                        lockedCompetition?.name ||
                        (form.competitionId ? 'Tu liga' : 'Cargando…')
                      }
                      disabled
                    />
                    <small className="text-muted">
                      La temporada se crea en tu liga.
                    </small>
                  </>
                ) : (
                  <select
                    className="form-select"
                    name="competitionId"
                    value={form.competitionId}
                    onChange={handleChange}
                    required
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
                <label className="form-label">Fecha inicio</label>
                <input
                  type="date"
                  className="form-control"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Fecha fin</label>
                <input
                  type="date"
                  className="form-control"
                  name="endDate"
                  value={form.endDate}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Estado inicial</label>
                <select
                  className="form-select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value={SEASON_STATUS.PENDING}>
                    {SEASON_STATUS_LABEL.PENDING}
                  </option>
                  <option value={SEASON_STATUS.ACTIVE}>
                    {SEASON_STATUS_LABEL.ACTIVE}
                  </option>
                </select>
                <small className="text-muted">
                  Si eliges Activa, la temporada ACTIVE anterior pasará a
                  Finalizada.
                </small>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mt-3">
                Error: {JSON.stringify(error)}
              </div>
            )}

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Crear y continuar'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/seasons')}
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
