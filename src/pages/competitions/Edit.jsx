import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import { clearCompetitionsErrors, getCompetitionById, updateCompetition } from '../../store/competitionsSlice';
import { getUsers } from '../../store/usersSlice';

const CompetitionEdit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { countries = [], loading: countriesLoading = false } = useSelector((state) => state.catalogCountries || {});
  const {
    competition,
    loadingOne = false,
    loadingOneError = null,
    updating = false,
    updateError = null,
  } = useSelector((state) => state.competitions || {});
  const { users = [], loading: usersLoading = false } = useSelector((state) => state.users || {});

  const managerUsers = users.filter((u) => u?.profile?.name === 'MANAGER_LEAGUE');

  const [logoPreview, setLogoPreview] = useState('');
  const [formData, setFormData] = useState({
    countryId: '',
    name: '',
    type: 'league',
    gender: '',
    season: '',
    file: null,
    isActive: true,
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
    if (id) dispatch(getCompetitionById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (!competition) return;
    setFormData({
      countryId: competition?.countryId ?? competition?.country?.id ?? '',
      name: competition?.name ?? '',
      type: competition?.type ?? 'league',
      gender: competition?.gender ?? '',
      season: competition?.season ?? '',
      file: null,
      isActive: Boolean(competition?.isActive ?? true),
      managerUserId: competition?.managerUserId || '',
    });
    setLogoPreview(competition?.logo ?? '');
  }, [competition]);

  useEffect(() => {
    if (updateError) dispatch(clearCompetitionsErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.countryId, formData.name, formData.type, formData.gender, formData.season, formData.managerUserId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleActiveChange = (e) => {
    const checked = e.target.checked;
    setFormData((prev) => ({ ...prev, isActive: checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));

    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setLogoPreview(String(reader.result || ''));
    reader.readAsDataURL(file);
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
        isActive: formData.isActive,
      };

      await dispatch(updateCompetition({ id, data: payload })).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Competencia actualizada',
        confirmButtonText: 'Aceptar',
      }).then(() => navigate('/competitions'));
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'No se pudo actualizar la competencia.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonText: 'Aceptar',
      });
    }
  };

  if (loadingOne) {
    return (
      <div className="container mt-4">
        <div className="card shadow">
          <div className="card-body text-center">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3">Cargando competencia...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingOneError) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger">
          {typeof loadingOneError === 'string' ? loadingOneError : 'Error cargando competencia'}
        </div>
        <ButtonNavigation url="/competitions" icon="bi bi-arrow-left" text="Volver" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Editar Competencia</h4>
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
                  disabled={updating}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {logoPreview && (
            <div className="mb-3 text-center">
              <img
                src={logoPreview}
                alt="Logo preview"
                className="img-thumbnail"
                style={{ maxWidth: '150px', maxHeight: '150px' }}
              />
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-check form-switch mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="competitionActiveSwitch"
                checked={formData.isActive}
                onChange={handleActiveChange}
                disabled={updating}
              />
              <label className="form-check-label" htmlFor="competitionActiveSwitch">
                Activa
              </label>
            </div>

            <div className="mb-3">
              <label className="form-label">País *</label>
              <select
                className="form-select"
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                required
                disabled={updating || countriesLoading}
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
                disabled={updating}
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
                  disabled={updating}
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
                  disabled={updating}
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
                  disabled={updating}
                />
                <small className="text-muted">
                  Las ediciones anuales se gestionan en <strong>Temporadas</strong>.
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
                disabled={updating || usersLoading}
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
              <label className="form-label">Actualizar logo (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                disabled={updating}
              />
              <small className="text-muted">Si no seleccionas archivo, se mantiene el logo actual.</small>
            </div>

            {updateError && (
              <div className="alert alert-danger">
                {typeof updateError === 'string' ? updateError : 'Error actualizando competencia'}
              </div>
            )}

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={updating || !formData.countryId || !formData.managerUserId}>
                {updating ? <ClipLoader color="#fff" size={18} /> : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompetitionEdit;

