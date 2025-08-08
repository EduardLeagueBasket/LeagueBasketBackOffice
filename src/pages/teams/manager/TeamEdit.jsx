import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getTeamByManager } from '../../../store/teams/getTeamSlice';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import UploadLeagueLogoModal from '../../../components/Modals/UploadLeagueLogo';

const TeamManagerEdit = () => {
  const dispatch = useDispatch();

  const { team = {}, loading: updateLoading } = useSelector(state => state.team);
  const { user: currentUser } = useSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    country: '',
    managerUserId: '',
    logoUrl: '',
  });

  useEffect(() => {
    dispatch(getTeamByManager());
    //dispatch(getUsers({ limit: 100, page: 1 }));
    //dispatch(getManagerLeague()); // Obtener la liga del gerente logueado
  }, []);

  /*useEffect(() => {
    if (managerLeague && Object.keys(managerLeague).length > 0) {
      setFormData({
        name: managerLeague.name || '',
        description: managerLeague.description || '',
        country: managerLeague.country || '',
        managerUserId: managerLeague.managerUserId || '',
        logoUrl: managerLeague.logoUrl || '',
      });
    }
  }, [managerLeague]);*/

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const payload = {
        //        id: managerLeague?.id,
        name: formData.name,
        description: formData.description,
        country: formData.country,
        managerUserId: formData.managerUserId,
        logoUrl: formData.logoUrl,
      };
      console.log(payload);

      //await dispatch(updateLeague(payload)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Liga actualizada correctamente',
        confirmButtonText: 'Aceptar',
      });

      setIsEditing(false);
    } catch (error) {
      console.error('Error actualizando liga:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error actualizando liga. Intenta nuevamente.',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  const handleCancel = () => {
    // Restaurar valores originales
    setFormData({
      //name: managerLeague?.name || '',
      //description: managerLeague?.description || '',
      //country: managerLeague?.country || '',
      //managerUserId: managerLeague?.managerUserId || '',
      //logoUrl: managerLeague?.logoUrl || '',
    });
    setIsEditing(false);
  };

  if (updateLoading) {
    return (
      <div className="container mt-4 text-center">
        <ClipLoader color="#007bff" size={50} />
        <p className="mt-2">Cargando liga...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Mi Equipo - {team?.name || 'Cargando...'}</h4>
          <div className="d-flex gap-2">
            {team?.id && (
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setShowUploadModal(true)}
              >
                <i className="bi bi-pencil"></i> Cambiar Logo
              </button>
            )}
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil"></i> Editar
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCancel}
                >
                  <i className="bi bi-x"></i> Cancelar
                </button>
                <button
                  type="submit"
                  form="league-form"
                  className="btn btn-success"
                  disabled={updateLoading}
                >
                  {updateLoading ? (
                    <ClipLoader color="#fff" size={16} />
                  ) : (
                    <>
                      <i className="bi bi-check"></i> Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          {/* Logo de la liga */}
          {team?.logoUrl && (
            <div className="text-center mb-4">
              <img
                src={team.logoUrl}
                alt="Logo de la liga"
                className="img-thumbnail"
                style={{ maxWidth: '150px', maxHeight: '150px' }}
              />
            </div>
          )}

          <form id="league-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={team?.name}
                onChange={handleChange}
                disabled={!isEditing}
                required
              />
              {!isEditing && (
                <small className="text-muted">
                  El nombre de la liga no puede ser modificado
                </small>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-control"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                rows="3"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">País</label>
              <input
                type="text"
                className="form-control"
                name="country"
                value={`${team?.league?.country}`}
                disabled={true}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Gerente</label>
              <input
                type="text"
                className="form-control"
                name="usermanager"
                value={`${currentUser.name} ${currentUser.lastName}`}
                disabled={true}
                required
              />
            </div>

            {/* Información adicional solo lectura */}
            {team?.createdAt && (
              <div className="mb-3">
                <label className="form-label">Fecha de Creación</label>
                <input
                  type="text"
                  className="form-control"
                  value={new Date(team.createdAt).toLocaleDateString('es-ES')}
                  disabled
                />
              </div>
            )}

            {team?.teamsCount !== undefined && (
              <div className="mb-3">
                <label className="form-label">Equipos Registrados</label>
                <input
                  type="text"
                  className="form-control"
                  value={team.teamsCount || 0}
                  disabled
                />
              </div>
            )}
          </form>
        </div>
      </div>

      <UploadLeagueLogoModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploaded={(uploadedUrl) => {
          setFormData(prev => ({ ...prev, logoUrl: uploadedUrl }));
          setShowUploadModal(false);
        }}
        referenceId={team?.id}
        reloadData={() => getTeamByManager()}
        folder="team-logo"
        type="team"
      />
    </div>
  );
};

export default TeamManagerEdit;