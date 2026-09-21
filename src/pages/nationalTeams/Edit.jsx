import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalTeamById, updateNationalTeam, resetUpdateNationalTeamState } from '../../store/nationalTeams/updateNationalTeamSlice';
import UploadNationalTeamLogoModal from '../../components/Modals/UploadNationalTeamLogo';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';
import { getCompetitions } from '../../store/competitionsSlice';
import { getUsers } from '../../store/usersSlice';

export default function EditNationalTeam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { nationalTeam, loading, error, success } = useSelector(state => state.updateNationalTeam);
  const { countries = [] } = useSelector((state) => state.catalogCountries || {});
  const { competitions = [], loading: competitionsLoading = false } = useSelector((state) => state.competitions || {});
  const { users = [], loading: usersLoading = false } = useSelector((state) => state.users || {});
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    countryId: '',
    countryCode: '',
    gender: 'male',
    category: 'senior',
    competitionId: '',
    logo: '',
    managerUserId: '',
    type: 'national_team',
    region: '',
  });

  const managerUsers = users.filter((u) =>
    formData.type === 'regional'
      ? u?.profile?.name === 'MANAGER_REGIONAL_TEAM'
      : u?.profile?.name === 'MANAGER_NATIONAL_TEAM',
  );

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getNationalTeamById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    dispatch(getCatalogCountries());
    dispatch(getCompetitions());
    dispatch(getUsers({ page: 1, limit: 200 }));
  }, [dispatch]);

  useEffect(() => {
    if (nationalTeam) {
      const countryCode = (nationalTeam.countryCode || '').toUpperCase();
      const matchCountry =
        countries.find((c) => c.id === nationalTeam.countryId) ||
        countries.find((c) => (c.countryCode || '').toUpperCase() === countryCode);

      setFormData({
        name: nationalTeam.name || '',
        countryId: nationalTeam.countryId || matchCountry?.id || '',
        countryCode: (matchCountry?.countryCode || countryCode).toUpperCase(),
        gender: nationalTeam.gender || 'male',
        category: nationalTeam.category || 'senior',
        competitionId: nationalTeam.competitionId || '',
        logo: nationalTeam.logo || '',
        managerUserId: nationalTeam.managerUserId || '',
        type: nationalTeam.type || 'national_team',
        region: nationalTeam.region || '',
      });
    }
  }, [nationalTeam, countries]);

  const selectedCountry = countries.find((c) => c.id === formData.countryId);
  const competitionTypeAllowed = formData.category === 'three_x_three' ? '3x3' : 'national_team';
  const competitionOptions = competitions.filter((c) => {
    const cCountryId = c?.countryId ?? c?.country?.id;
    if (formData.countryId && cCountryId !== formData.countryId) return false;
    if (c?.type && c.type !== competitionTypeAllowed) return false;
    return true;
  });

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Equipo actualizado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        dispatch(resetUpdateNationalTeamState());
        navigate('/nationals-teams');
      });
    }
  }, [success, dispatch, navigate]);

  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo nacional es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    } else {
      // Validación de caracteres especiales (opcional)
      const nameRegex = /^[a-zA-Z0-9\s\-_.]+$/;
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name = 'El nombre solo puede contener letras, números, espacios, guiones, guiones bajos y puntos';
      }
    }

    if (!formData.countryId) newErrors.countryId = 'El país es requerido';
    if (!formData.countryCode.trim()) newErrors.countryCode = 'El código de país es requerido';
    if (!formData.gender) newErrors.gender = 'El género es requerido';
    if (!formData.category) newErrors.category = 'La categoría es requerida';
    if (!formData.managerUserId) newErrors.managerUserId = 'Debes seleccionar el manager';
    if (formData.type === 'regional' && !formData.region.trim()) {
      newErrors.region = 'La región es requerida para un equipo regional';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const next = { ...prev, [name]: value };

      if (name === 'countryId') {
        const country = countries.find((c) => c.id === value);
        next.countryCode = (country?.countryCode || '').toUpperCase();
        next.competitionId = '';
      }

      if (name === 'category') {
        next.competitionId = '';
      }

      if (name === 'type') {
        next.managerUserId = '';
        if (value !== 'regional') next.region = '';
      }

      return next;
    });

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar formulario antes de enviar
    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Error de validación',
        text: 'Por favor, corrige los errores en el formulario',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name.trim(),
        countryCode: formData.countryCode.trim().toUpperCase(),
        countryId: formData.countryId || undefined,
        gender: formData.gender,
        category: formData.category,
        logo: formData.logo || undefined,
        competitionId:
          formData.type === 'regional' ? null : formData.competitionId || undefined,
        managerUserId: formData.managerUserId || undefined,
        type: formData.type,
        region: formData.type === 'regional' ? formData.region.trim() : null,
      };

      await dispatch(updateNationalTeam({ id, data: payload })).unwrap();

    } catch (error) {
      const msg = typeof error === 'string' ? error : 'Error actualizando equipo nacional. Intenta nuevamente.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/nationals-teams');
  };

  const handleLogoUploaded = (logoUrl) => {
    setFormData(prev => ({
      ...prev,
      logo: logoUrl,
    }));
  };

  const reloadData = () => {
    // Función para recargar datos si es necesario
  };

  if (loading && !nationalTeam) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3">Cargando equipo nacional...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !nationalTeam) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Error al cargar el equipo nacional: {error}
            </div>
            <ButtonNavigation url="/nationals-teams" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Editar selección o equipo regional</h4>
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => setShowUploadModal(true)}
            >
              Subir Logo
            </button>
            <ButtonNavigation url="/nationals-teams" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: Selección Española"
                disabled={isSubmitting}
              />
              {errors.name && (
                <div className="invalid-feedback">
                  {errors.name}
                </div>
              )}
            </div>

            <div className="row">
              <div className={`mb-3 ${formData.type === 'regional' ? 'col-md-6' : 'col-md-12'}`}>
                <label className="form-label">Tipo *</label>
                <select
                  className="form-select"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="national_team">Selección nacional</option>
                  <option value="regional">Equipo regional</option>
                </select>
              </div>
              {formData.type === 'regional' && (
                <div className="col-md-6 mb-3">
                  <label className="form-label">Región *</label>
                  <input
                    type="text"
                    className={`form-control ${errors.region ? 'is-invalid' : ''}`}
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    placeholder="Ej: Zulia, Caracas, Carabobo"
                    disabled={isSubmitting}
                  />
                  {errors.region && <div className="invalid-feedback">{errors.region}</div>}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">País *</label>
              <select
                className={`form-select ${errors.countryId ? 'is-invalid' : ''}`}
                name="countryId"
                value={formData.countryId}
                onChange={handleChange}
                disabled={isSubmitting}
                required
              >
                <option value="">Selecciona un país</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.countryCode})
                  </option>
                ))}
              </select>
              {errors.countryId && <div className="invalid-feedback">{errors.countryId}</div>}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Código de país *</label>
                <input
                  type="text"
                  className={`form-control ${errors.countryCode ? 'is-invalid' : ''}`}
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleChange}
                  placeholder="Ej: VE"
                  disabled={isSubmitting || !!selectedCountry}
                  required
                />
                {errors.countryCode && <div className="invalid-feedback">{errors.countryCode}</div>}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Género *</label>
                <select
                  className={`form-select ${errors.gender ? 'is-invalid' : ''}`}
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                >
                  <option value="male">male</option>
                  <option value="female">female</option>
                  <option value="mixed">mixed</option>
                </select>
                {errors.gender && <div className="invalid-feedback">{errors.gender}</div>}
              </div>

              <div className="col-md-3 mb-3">
                <label className="form-label">Categoría *</label>
                <select
                  className={`form-select ${errors.category ? 'is-invalid' : ''}`}
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  required
                >
                  <option value="senior">senior</option>
                  <option value="u23">u23</option>
                  <option value="u19">u19</option>
                  <option value="u17">u17</option>
                  <option value="three_x_three">three_x_three</option>
                </select>
                {errors.category && <div className="invalid-feedback">{errors.category}</div>}
              </div>
            </div>

            {formData.type !== 'regional' && (
            <div className="mb-3">
              <label className="form-label">Competencia (opcional)</label>
              <select
                className="form-select"
                name="competitionId"
                value={formData.competitionId}
                onChange={handleChange}
                disabled={isSubmitting || competitionsLoading || !formData.countryId}
              >
                <option value="">
                  {formData.countryId
                    ? `Selecciona una competencia (${competitionTypeAllowed})`
                    : 'Primero selecciona un país'}
                </option>
                {competitionOptions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            )}

            <div className="mb-3">
              <label className="form-label">
                {formData.type === 'regional' ? 'Manager del equipo regional *' : 'Manager de la selección *'}
              </label>
              <select
                className={`form-select ${errors.managerUserId ? 'is-invalid' : ''}`}
                name="managerUserId"
                value={formData.managerUserId}
                onChange={handleChange}
                disabled={isSubmitting || usersLoading}
                required
              >
                <option value="">Selecciona un manager</option>
                {managerUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} {u.lastName ?? ''} — {u.email}
                  </option>
                ))}
              </select>
              {errors.managerUserId && <div className="invalid-feedback">{errors.managerUserId}</div>}
            </div>

            {formData.logo && (
              <div className="mb-3">
                <label className="form-label">Logo del Equipo</label>
                <div className="text-center">
                  <img
                    src={formData.logo}
                    alt="Logo del equipo"
                    className="img-fluid rounded shadow"
                    style={{ maxHeight: '150px' }}
                  />
                </div>
              </div>
            )}

            <div className="mb-3 d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Actualizar
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <UploadNationalTeamLogoModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={handleLogoUploaded}
        referenceId={id || currentUser?.id || 'temp'}
        reloadData={reloadData}
        folder="national-team-logos"
        type="national-team"
      />
    </div>
  );
} 