import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getUsers } from '../../store/usersSlice';
import { createTeam } from '../../store/teams/createTeamSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getCompetitions } from '../../store/competitionsSlice';

const AddTeam = () => {
  const dispatch = useDispatch();

  const { users = [], loading: usersLoading } = useSelector((state) => state.users);
  const { competitions = [], loading: competitionsLoading = false } = useSelector(
    (state) => state.competitions || {},
  );

  const [userList, setUserList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    competitionId: '',
    managerUserId: '',
  });

  /** Archivo local; la subida a Cloudinary ocurre solo al crear el equipo en el backend. */
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState('');
  const [logoInputKey, setLogoInputKey] = useState(0);

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getUsers({ limit: 100, page: 1, typeUser: 'manager-teams' }));
    dispatch(getCompetitions());
  }, [dispatch]);

  useEffect(() => {
    const nextUserList = users.filter((u) => u.profile?.name === 'MANAGER_TEAM');
    setUserList(nextUserList);
  }, [users]);

  useEffect(() => {
    return () => {
      if (logoPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewUrl);
      }
    };
  }, [logoPreviewUrl]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo es requerido';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'El nombre no puede exceder 50 caracteres';
    } else {
      const nameRegex = /^[a-zA-Z0-9\s\-_.]+$/;
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name =
          'El nombre solo puede contener letras, números, espacios, guiones, guiones bajos y puntos';
      }
    }

    if (!formData.competitionId) {
      newErrors.competitionId = 'Debe seleccionar una competencia (catálogo)';
    }

    if (!formData.managerUserId) {
      newErrors.managerUserId = 'Debe seleccionar un gerente de equipo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (logoPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewUrl);
    }

    setLogoFile(file);
    setLogoPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const fd = new FormData();
      fd.append('name', formData.name.trim());
      fd.append('competitionId', formData.competitionId);
      fd.append('managerUserId', formData.managerUserId);
      if (logoFile) {
        fd.append('file', logoFile);
      }

      await dispatch(createTeam(fd)).unwrap();
      dispatch(getTeams());

      Swal.fire({
        icon: 'success',
        title: 'Equipo creado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        setFormData({
          name: '',
          competitionId: '',
          managerUserId: '',
        });
        setErrors({});
        setLogoFile(null);
        if (logoPreviewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(logoPreviewUrl);
        }
        setLogoPreviewUrl('');
        setLogoInputKey((k) => k + 1);
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error creando equipo. Intenta nuevamente.',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const logoPreview = logoPreviewUrl;

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Crear nuevo equipo</h4>
          <div className="d-flex gap-2">
            <ButtonNavigation url="/teams" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>

        <div className="card-body">
          {logoPreview && (
            <div className="text-center mb-4">
              <img
                src={logoPreview}
                alt="Logo del equipo"
                className="img-thumbnail"
                style={{ maxWidth: '150px', maxHeight: '150px' }}
              />
            </div>
          )}

          <form id="team-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Competencia (catálogo) *</label>
              <select
                className={`form-select ${errors.competitionId ? 'is-invalid' : ''}`}
                name="competitionId"
                value={formData.competitionId}
                onChange={handleChange}
                disabled={competitionsLoading || isSubmitting}
              >
                <option value="">Selecciona una competencia</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.season ? ` — ${c.season}` : ''}
                  </option>
                ))}
              </select>
              {errors.competitionId && (
                <div className="invalid-feedback">{errors.competitionId}</div>
              )}
              {competitionsLoading && (
                <small className="text-muted">
                  <ClipLoader color="#007bff" size={12} /> Cargando competencias…
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre del Equipo *</label>
              <input
                type="text"
                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingresa el nombre del equipo"
                maxLength={50}
                disabled={isSubmitting}
              />
              {errors.name && <div className="invalid-feedback">{errors.name}</div>}
              <small className="text-muted">Mínimo 3 caracteres, máximo 50 caracteres</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Logo (opcional)</label>
              <input
                key={logoInputKey}
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleLogoFile}
                disabled={isSubmitting}
              />
              <small className="text-muted d-block mt-1">
                El archivo se sube al crear el equipo; no se guarda en la nube hasta enviar el formulario.
              </small>
            </div>

            <div className="mb-3">
              <label className="form-label">Gerente de Equipo *</label>
              <select
                className={`form-select ${errors.managerUserId ? 'is-invalid' : ''}`}
                name="managerUserId"
                value={formData.managerUserId}
                onChange={handleChange}
                disabled={usersLoading || isSubmitting}
              >
                <option value="">Selecciona un gerente de equipo</option>
                {userList.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastName ?? ''} - {user.email}
                  </option>
                ))}
              </select>
              {errors.managerUserId && (
                <div className="invalid-feedback">{errors.managerUserId}</div>
              )}
              {usersLoading && (
                <small className="text-muted">
                  <ClipLoader color="#007bff" size={12} /> Cargando gerentes…
                </small>
              )}
            </div>

            <div className="mb-3 d-flex justify-content-end gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || usersLoading || competitionsLoading}
              >
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Creando…
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-2"></i>
                    Crear Equipo
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddTeam;
