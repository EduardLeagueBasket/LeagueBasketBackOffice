import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getCompetitions } from '../../store/competitionsSlice';
import { createSeason } from '../../store/seasons/seasonsSlice';

export default function SeasonAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { saving, error } = useSelector((s) => s.seasons);
  const user = useSelector((s) => s.auth.user);
  const isAdmin =
    user?.profile?.name === 'ADMIN' || user?.profile?.name === 'SUPER_ADMIN';

  const [form, setForm] = useState({
    name: '',
    competitionId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (isAdmin) dispatch(getCompetitions());
  }, [dispatch, isAdmin]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSeason(form));
    if (createSeason.fulfilled.match(result)) {
      navigate('/seasons');
    }
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
        <div className="card-header">
          <h4 className="mb-0">Nueva temporada</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Nombre</label>
                <input
                  className="form-control"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="2025-2026"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">Competición</label>
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
              <div className="col-12">
                <div className="form-check">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="isActive"
                    name="isActive"
                    checked={form.isActive}
                    onChange={handleChange}
                  />
                  <label className="form-check-label" htmlFor="isActive">
                    Marcar como temporada activa
                  </label>
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger mt-3">
                Error: {JSON.stringify(error)}
              </div>
            )}

            <div className="mt-4 d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Guardando…' : 'Guardar'}
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
