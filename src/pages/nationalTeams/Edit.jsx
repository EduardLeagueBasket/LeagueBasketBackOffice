import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalTeamById, updateNationalTeam, resetUpdateNationalTeamState } from '../../store/nationalTeams/updateNationalTeamSlice';
import UploadNationalTeamLogoModal from '../../components/Modals/UploadNationalTeamLogo';

export default function EditNationalTeam() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { nationalTeam, loading, error, success } = useSelector(state => state.updateNationalTeam);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    country: '',
    logoUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getNationalTeamById(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (nationalTeam) {
      setFormData({
        name: nationalTeam.name || '',
        country: nationalTeam.country || '',
        logoUrl: nationalTeam.logoUrl || '',
      });
    }
  }, [nationalTeam]);

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Equipo Nacional actualizado correctamente',
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
      const nameRegex = /^[a-zA-Z0-9\s\-_\.]+$/;
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name = 'El nombre solo puede contener letras, números, espacios, guiones, guiones bajos y puntos';
      }
    }

    // Validación del país
    if (!formData.country.trim()) {
      newErrors.country = 'El país es requerido';
    } else if (formData.country.trim().length < 2) {
      newErrors.country = 'El país debe tener al menos 2 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

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
        country: formData.country.trim(),
        logoUrl: formData.logoUrl,
      };
      console.log('Payload a enviar:', payload);

      await dispatch(updateNationalTeam({ id, data: payload })).unwrap();

    } catch (error) {
      console.error('Error actualizando equipo nacional:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error actualizando equipo nacional. Intenta nuevamente.',
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
      logoUrl: logoUrl,
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
          <h4>Editar Equipo Nacional</h4>
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
              <label className="form-label">Nombre del Equipo Nacional *</label>
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

            <div className="mb-3">
              <label className="form-label">País *</label>
              <input
                type="text"
                className={`form-control ${errors.country ? 'is-invalid' : ''}`}
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Ej: España"
                disabled={isSubmitting}
              />
              {errors.country && (
                <div className="invalid-feedback">
                  {errors.country}
                </div>
              )}
            </div>

            {formData.logoUrl && (
              <div className="mb-3">
                <label className="form-label">Logo del Equipo</label>
                <div className="text-center">
                  <img
                    src={formData.logoUrl}
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
                    Actualizar Equipo Nacional
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
        referenceId={currentUser?.id || 'temp'}
        reloadData={reloadData}
        folder="national-team-logos"
        type="national-team"
      />
    </div>
  );
} 