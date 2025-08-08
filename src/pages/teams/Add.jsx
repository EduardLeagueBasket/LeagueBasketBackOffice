import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getUsers } from '../../store/usersSlice';
import ButtonAction from '../../components/Button/ButtonAction';
import { createTeam } from '../../store/teams/createTeamSlice';

const AddTeam = () => {
  const dispatch = useDispatch();

  const { user: currentUser } = useSelector((state) => state.auth);
  const { users = [], loading: usersLoading } = useSelector(state => state.users);
  const [userList, setUserList] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    managerUserId: '',
    logoUrl: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(getUsers({ limit: 100, page: 1, typeUser: 'manager-teams' }));
  }, []);

  useEffect(() => {
    handleUser();
  }, [users]);

  const handleUser = () => {
    const userList = users.filter(user => user.profile.name === 'MANAGER_TEAM');
    setUserList(userList);
  };

  const validateForm = () => {
    const newErrors = {};

    // Validación del nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre del equipo es requerido';
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

    // Validación del gerente
    if (!formData.managerUserId) {
      newErrors.managerUserId = 'Debe seleccionar un gerente de equipo';
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
        managerUserId: formData.managerUserId,
        logoUrl: formData.logoUrl,
      };
      console.log('Payload a enviar:', payload);

      await dispatch(createTeam(payload)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Equipo creado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        // Limpiar formulario después del éxito
        setFormData({
          name: '',
          managerUserId: '',
          logoUrl: '',
        });
        setErrors({});
      });

    } catch (error) {
      console.error('Error creando equipo:', error);
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

  const handleCancel = () => {
    setFormData({
      name: '',
      managerUserId: '',
      logoUrl: '',
    });
    setErrors({});
  };


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
          {/* Logo de la liga */}
          {formData.logoUrl && (
            <div className="text-center mb-4">
              <img
                src={formData.logoUrl}
                alt="Logo de la liga"
                className="img-thumbnail"
                style={{ maxWidth: '150px', maxHeight: '150px' }}
              />
            </div>
          )}

          <form id="league-form" onSubmit={handleSubmit}>
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
              {errors.name && (
                <div className="invalid-feedback">
                  {errors.name}
                </div>
              )}
              <small className="text-muted">
                Mínimo 3 caracteres, máximo 50 caracteres
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
                {userList.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.lastName ?? ''} - {user.email}
                  </option>
                ))}
              </select>
              {errors.managerUserId && (
                <div className="invalid-feedback">
                  {errors.managerUserId}
                </div>
              )}
              {usersLoading && (
                <small className="text-muted">
                  <ClipLoader color="#007bff" size={12} /> Cargando gerentes...
                </small>
              )}
            </div>
            <div className="mb-3 d-flex justify-content-end gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSubmitting || usersLoading}
              >
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Creando...
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