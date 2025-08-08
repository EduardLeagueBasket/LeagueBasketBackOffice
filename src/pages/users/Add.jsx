import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getProfiles } from '../../store/profileSlice';
import { createUser } from '../../store/createUserSlice';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2'
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import ButtonAction from '../../components/Button/ButtonAction';
import { mapProfileName } from '../../utils/MapRoleName';

const Users = () => {
  const { user } = useSelector((state) => state.auth);
  console.log('user', user);
  const dispatch = useDispatch();
  const [profiles, setProfiles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    perfil: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (profiles.length === 0) {
      handleGetProfiles();
    }
  });

  const handleGetProfiles = async () => {
    const result = await dispatch(getProfiles());

    if (result.payload.length > 0) {
      const rawProfiles = result.payload;

      const filteredProfiles = rawProfiles
        .filter(profile => profile.name !== 'USER')
        .map(profile => {
          if (user.profile.name === 'MANAGER_LEAGUE' || user.profile.name === 'ASISTANT_LEAGUE') {
            if (profile.name === 'MANAGER_TEAM' || profile.name === 'ASISTANT_LEAGUE') {
              return {
                ...profile,
                name: mapProfileName(profile.name),
              };
            }
            return null; // <- Evita undefined
          } else {
            return {
              ...profile,
              name: mapProfileName(profile.name),
            };
          }
        })
        .filter(profile => profile !== null);


      setProfiles(filteredProfiles);
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar error cuando el usuario empiece a escribir
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nombre.trim()) newErrors.nombre = 'El nombre es requerido';
    if (!formData.apellido.trim()) newErrors.apellido = 'El apellido es requerido';
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }
    if (!formData.telefono.trim()) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.perfil) newErrors.perfil = 'Debe seleccionar un perfil';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    if (!validateForm()) {
      setIsLoading(false);
      return;
    };


    try {
      const data = {
        name: formData.nombre,
        lastName: formData.apellido,
        email: formData.email,
        phone: formData.telefono,
        profileId: formData.perfil
      }
      const resp = await dispatch(createUser(data));
      if (createUser.rejected.match(resp)) {
        Swal.fire({
          title: 'Error',
          text: resp.payload,
          icon: 'error'
        });
        return;
      }
      Swal.fire({
        title: 'Usuario creado correctamente',
        text: 'El usuario ha sido creado correctamente',
        icon: 'success'
      });
      handleCancel();
    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear el usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      perfil: ''
    });
    setErrors({});
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="card chart-card">
          <div className="card-header d-flex justify-content-between">
            <h3 className="card-title">Agregar nuevo Usuario</h3>
            <ButtonNavigation url="/users" icon="bi bi-arrow-bar-left" text="Volver atrás" />
          </div>

          <div className="card-body px-5 py-4">
            <form>
              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Nombre</label>
                  <input type="text" className="form-control" placeholder="Ingrese el nombre" onChange={handleInputChange} name="nombre" value={formData.nombre} />
                  {errors.nombre && <small className="text-danger">{errors.nombre}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Apellido</label>
                  <input type="text" className="form-control" placeholder="Ingrese el apellido" onChange={handleInputChange} name="apellido" value={formData.apellido} />
                  {errors.apellido && <small className="text-danger">{errors.apellido}</small>}
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input type="email" className="form-control" placeholder="ejemplo@correo.com" onChange={handleInputChange} name="email" value={formData.email} />
                  {errors.email && <small className="text-danger">{errors.email}</small>}
                </div>
                <div className="col-md-6 mb-3">
                  <label className="form-label">Teléfono</label>
                  <input type="tel" className="form-control" placeholder="Número de contacto" onChange={handleInputChange} name="telefono" value={formData.telefono} />
                  {errors.telefono && <small className="text-danger">{errors.telefono}</small>}
                </div>
              </div>

              <div className="row mb-4">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Perfil</label>
                  <select className="form-select" onChange={handleInputChange} name="perfil" value={formData.perfil}>
                    <option key="0" value="">Seleccione un perfil</option>
                    {profiles.map((profile) => (
                      <option key={profile.id} value={profile.id}>{profile.name}</option>
                    ))}
                  </select>
                  {errors.perfil && <small className="text-danger">{errors.perfil}</small>}
                </div>
              </div>

              <div className="d-flex justify-content-end">
                {
                  isLoading ?
                    <ClipLoader
                      color={"#000"}
                      //loading={isLoading}
                      size={40}
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    /> :
                    <ButtonAction
                      text={'Guardar Usuario'}
                      onClick={handleSubmit}
                      type="submit"
                      classBtn="btn-primary"
                      icon="bi bi-floppy2-fill"
                    />
                }
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Users;