import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../../components/Button/ButtonNavigation';
import { getTeamByManager, updateTeam } from '../../../store/teams/getTeamSlice';

const TeamManagerEdit = () => {
  const dispatch = useDispatch();

  const { team = {}, loading } = useSelector((state) => state.team);
  const { user: currentUser } = useSelector((state) => state.auth);

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '' });

  /** Logo nuevo (solo se sube al guardar; el backend envía a Cloudinary). */
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewBlob, setLogoPreviewBlob] = useState('');
  const [logoInputKey, setLogoInputKey] = useState(0);

  useEffect(() => {
    dispatch(getTeamByManager());
  }, [dispatch]);

  useEffect(() => {
    if (team?.id) {
      setFormData({ name: team.name || '' });
    }
  }, [team?.id, team?.name]);

  useEffect(() => {
    return () => {
      if (logoPreviewBlob.startsWith('blob:')) {
        URL.revokeObjectURL(logoPreviewBlob);
      }
    };
  }, [logoPreviewBlob]);

  const displayLogo = useMemo(() => {
    if (logoPreviewBlob) return logoPreviewBlob;
    return team.logo || team.logoUrl || '';
  }, [logoPreviewBlob, team.logo, team.logoUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (logoPreviewBlob.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewBlob);
    }
    setLogoFile(file);
    setLogoPreviewBlob(URL.createObjectURL(file));
  };

  const resetLogoPick = () => {
    setLogoFile(null);
    if (logoPreviewBlob.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreviewBlob);
    }
    setLogoPreviewBlob('');
    setLogoInputKey((k) => k + 1);
  };

  const handleCancel = () => {
    setFormData({ name: team.name || '' });
    resetLogoPick();
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team?.id) return;

    const nameTrim = formData.name.trim();
    if (!nameTrim) {
      Swal.fire({
        icon: 'error',
        title: 'Validación',
        text: 'El nombre del equipo es obligatorio.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    try {
      const fd = new FormData();
      fd.append('name', nameTrim);
      if (logoFile) {
        fd.append('file', logoFile);
      }

      await dispatch(updateTeam({ teamId: team.id, formData: fd })).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'Equipo actualizado',
        confirmButtonText: 'Aceptar',
      });

      resetLogoPick();
      setIsEditing(false);
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el equipo.',
        confirmButtonText: 'Aceptar',
      });
    }
  };

  if (loading && !team?.id) {
    return (
      <div className="container mt-4 text-center">
        <ClipLoader color="#007bff" size={50} />
        <p className="mt-2">Cargando equipo…</p>
      </div>
    );
  }

  if (!team?.id) {
    return (
      <div className="container mt-4">
        <div className="alert alert-info">
          No hay un equipo asociado a tu cuenta o no se pudo cargar.
        </div>
        <ButtonNavigation url="/teams" icon="bi bi-arrow-left" text="Volver" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0">Mi equipo — {team.name || 'Sin nombre'}</h4>
          <div className="d-flex gap-2 flex-wrap">
            <ButtonNavigation url="/teams" icon="bi bi-arrow-left" text="Volver" />
            {!isEditing ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil me-1"></i>
                Editar
              </button>
            ) : (
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                  <i className="bi bi-x-lg me-1"></i>
                  Cancelar
                </button>
                <button
                  type="submit"
                  form="team-edit-form"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? <ClipLoader color="#fff" size={16} /> : (
                    <>
                      <i className="bi bi-check-lg me-1"></i>
                      Guardar
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-body">
          {displayLogo ? (
            <div className="text-center mb-4">
              <img
                src={displayLogo}
                alt="Logo del equipo"
                className="img-thumbnail"
                style={{ maxWidth: '150px', maxHeight: '150px', objectFit: 'contain' }}
              />
            </div>
          ) : (
            <p className="text-muted text-center small">Sin logo</p>
          )}

          <form id="team-edit-form" onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre del equipo</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                maxLength={80}
              />
            </div>

            {isEditing && (
              <div className="mb-3">
                <label className="form-label">Cambiar logo (opcional)</label>
                <input
                  key={logoInputKey}
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={handleLogoFile}
                  disabled={loading}
                />
                <small className="text-muted d-block mt-1">
                  La imagen se sube al guardar; no se envía a la nube hasta confirmar.
                </small>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label">Gerente</label>
              <input
                type="text"
                className="form-control"
                value={
                  currentUser
                    ? `${currentUser.name ?? ''} ${currentUser.lastName ?? ''}`.trim()
                    : ''
                }
                disabled
              />
            </div>

            {team.competitionId && (
              <div className="mb-3">
                <label className="form-label">ID competencia</label>
                <input type="text" className="form-control" value={team.competitionId} disabled />
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeamManagerEdit;
