import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { ClipLoader } from "react-spinners";
import ButtonAction from '../../components/Button/ButtonAction';
import { getUserDetail } from '../../store/userDetailSlice';
import { useDispatch, useSelector } from 'react-redux';
import { mapProfileName } from '../../utils/MapRoleName';
import { getProfiles } from '../../store/profileSlice';
import { userUpdate } from '../../store/userUpdateSlice';
import Swal from 'sweetalert2'
import { filterCreatableProfiles } from '../../utils/userCreationPolicy';

export default function Edit() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [user, setUser] = useState(null);
  const { user: userAuth, loading: isLoading } = useSelector((state) => state.auth);
  const [profiles, setProfiles] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    perfil: ''
  });
  const [errors, setErrors] = useState({});

  const handleGetUser = useCallback(async () => {
    const response = await dispatch(getUserDetail(id));

    if (getUserDetail.fulfilled.match(response)) {
      setUser(response.payload);
      setFormData({
        nombre: response.payload.name,
        apellido: response.payload.lastName,
        email: response.payload.email,
        telefono: response.payload.phone,
        perfil: response.payload?.profile?.id
      });
    }
  }, [dispatch, id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleWhoPerformedAction = (history) => {
    return `${history?.performedByUser?.name} ${history?.performedByUser?.lastName} ${history?.performedByUser?.id === userAuth?.id ? "(Yo)" : ''}`;
  }

  const handleActionPerformed = (history) => {
    let title = '';
    switch (history?.action) {
      case 'CREATE USER':
        title = 'Creación de usuario';
        break;
      case 'UPDATE USER':
        title = 'Actualización de usuario';
        break;
      default:
        title = history?.action;
        break;
    }
    return title;
  }

  const handleGetProfiles = useCallback(async () => {
    const result = await dispatch(getProfiles());

    if (result.payload.length > 0) {
      const rawProfiles = result.payload;

      const filteredProfiles = filterCreatableProfiles(
        userAuth?.profile?.name,
        rawProfiles,
      )
        .map(profile => ({
          ...profile,
          name: mapProfileName(profile.name),
        }));

      setProfiles(filteredProfiles);
    }
  }, [dispatch, userAuth?.profile?.name]);

  useEffect(() => {
    handleGetUser();
    if (profiles.length === 0) {
      handleGetProfiles();
    }
  }, [handleGetProfiles, handleGetUser, profiles.length]);

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
    e.preventDefault();

    if (!validateForm()) {
      return;
    };


    try {
      const data = {
        name: formData.nombre,
        lastName: formData.apellido,
        email: formData.email,
        phone: formData.telefono,
        profileId: `${formData.perfil}`,
        id: id
      }

      const resp = await dispatch(userUpdate(data));
      if (userUpdate.rejected.match(resp)) {
        Swal.fire({
          title: 'Error',
          text: JSON.stringify(resp.payload),
          icon: 'error'
        });
        return;
      }

    } catch (error) {
      console.error('Error al crear usuario:', error);
      alert('Error al crear el usuario');
    }
  };

  const handleParseProfile = (history) => {
    if (history?.field === 'profileId') {
      const newValue = profiles.find(p => p.id === history.newValue)?.name || 'No definido';
      const oldValue = profiles.find(p => p.id === history.oldValue)?.name || 'No definido';
      return `${oldValue} -> ${newValue}`;
    }
    return history.newValue;
  }

  return (<div className="row">

    <div className="col-12">
      <div className="card chart-card">
        <div className="card-header d-flex justify-content-between">
          <h3 className="card-title">Detalles del Usuario</h3>
          <ButtonNavigation url="/users" icon="bi bi-arrow-bar-left" text="Volver atrás" />
        </div>

        <div className="card-body px-5 py-4">

          <form>
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre</label>
                <input type="text" className="form-control" placeholder="Ingrese el nombre"
                  onChange={handleInputChange} name="nombre" value={formData.nombre} />
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
                    text={'Actualizar'}
                    onClick={handleSubmit}
                    type="submit"
                    classBtn="btn-primary"
                    icon="bi bi-check-all"
                  />
              }
            </div>
          </form>
          <hr className="hr" />
          <h3 className="card-title">Historial de cambios</h3>
          <div className="row">
            <div className="table-responsive">
              <table className="table table-bordered table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Nombre</th>
                    <th>Apellido</th>
                    <th>Email</th>
                    <th>Acción realizada</th>
                    <th>Cambios</th>
                    <th>Accion realizada por</th>
                    {/*<th>Teléfono</th>
                    <th>Acciones</th>*/}
                  </tr>
                </thead>
                <tbody>
                  {user?.userHistory.map((history) => (
                    <tr key={history.id}>
                      <td>{history.user.name}</td>
                      <td>{history.user.lastName}</td>
                      <td>{history.user.email}</td>
                      <td>{handleActionPerformed(history)}</td>
                      <td>{handleParseProfile(history)}</td>
                      <td>{handleWhoPerformedAction(history)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}