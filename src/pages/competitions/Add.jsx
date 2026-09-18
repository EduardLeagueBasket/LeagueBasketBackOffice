import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import { clearCompetitionsErrors, createCompetition } from '../../store/competitionsSlice';
import { getUsers } from '../../store/usersSlice';

const CompetitionAdd = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { countries = [], loading: countriesLoading = false } = useSelector((state) => state.catalogCountries || {});
  const { creating = false, createError = null } = useSelector((state) => state.competitions || {});
  const { users = [], loading: usersLoading = false } = useSelector((state) => state.users || {});

  const managerUsers = users.filter((u) => u?.profile?.name === 'MANAGER_LEAGUE');

  const [formData, setFormData] = useState({
    countryId: '',
    name: '',
    type: 'league',
    gender: '',
    season: '',
    file: null,
    managerUserId: '',
  });

  const templates = useMemo(() => ([
    { label: 'Super Liga de Venezuela', name: 'Super Liga de Venezuela', type: 'league', gender: 'male' },
    { label: 'Liga de Desarrollo', name: 'Liga de Desarrollo', type: 'league', gender: 'male' },
    { label: 'Selección Nacional', name: 'Selección Nacional', type: 'national_team', gender: 'male' },
    { label: 'Selección 3x3', name: 'Selección 3x3', type: '3x3', gender: 'mixed' },
  ]), []);

  useEffect(() => {
    dispatch(getCatalogCountries());
    dispatch(getUsers({ page: 1, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (createError) dispatch(clearCompetitionsErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.countryId, formData.name, formData.type, formData.gender, formData.season, formData.managerUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const applyTemplate = (t) => {
    setFormData((prev) => ({
      ...prev,
      name: t.name,
      type: t.type,
      gender: t.gender ?? '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        type: formData.type,
        gender: formData.gender || null,
        season: formData.season.trim() || null,
        countryId: formData.countryId,
        managerUserId: formData.managerUserId,
        file: formData.file,
      };

      await dispatch(createCompetition(payload)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Competencia creada correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => navigate('/competitions'));
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'No se pudo crear la competencia.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonText: 'Aceptar',
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Crear Competencia</h4>
          <ButtonNavigation url="/competitions" icon="bi bi-arrow-left" text="Volver" />
        </div>

        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Plantillas rápidas</label>
            <div className="d-flex flex-wrap gap-2">
              {templates.map((t) => (
                <button
                  key={t.label}
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => applyTemplate(t)}
                  disabled={creating}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <small className="text-muted">Solo te rellenan nombre/tipo/género.</small>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">País *</label>
              <select
                className="form-select"
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                required
                disabled={creating || countriesLoading}
              >
                <option value="">Selecciona un país</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.countryCode})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={creating}
                placeholder="Ej: Super Liga de Venezuela"
              />
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo *</label>
                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  disabled={creating}
                >
                  <option value="league">league</option>
                  <option value="national_team">national_team</option>
                  <option value="women">women</option>
                  <option value="3x3">3x3</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Género</label>
                <select
                  className="form-select"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={creating}
                >
                  <option value="">(opcional)</option>
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="mixed">mixed</option>
                </select>
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Etiqueta (opcional)</label>
                <input
                  type="text"
                  className="form-control"
                  name="season"
                  value={formData.season}
                  onChange={handleChange}
                  disabled={creating}
                  placeholder="Ej: Liga profesional"
                />
                <small className="text-muted">
                  Las ediciones 2025-2026, 2026-2027, etc. se gestionan en{' '}
                  <strong>Temporadas</strong>, no aquí.
                </small>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Gerente de la liga *</label>
              <select
                className="form-select"
                name="managerUserId"
                value={formData.managerUserId}
                onChange={handleChange}
                required
                disabled={creating || usersLoading}
              >
                <option value="">
                  {usersLoading ? 'Cargando usuarios...' : 'Selecciona un gerente'}
                </option>
                {managerUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.lastName ?? ''} — {u.email}
                  </option>
                ))}
              </select>
              <small className="text-muted">
                Este usuario será quien administre juegos, equipos e historias de esta liga.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Logo (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                disabled={creating}
              />
            </div>

            {createError && (
              <div className="alert alert-danger">
                {typeof createError === 'string' ? createError : 'Error creando competencia'}
              </div>
            )}

            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={creating || !formData.countryId || !formData.managerUserId}
              >
                {creating ? <ClipLoader color="#fff" size={18} /> : 'Crear Competencia'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompetitionAdd;

