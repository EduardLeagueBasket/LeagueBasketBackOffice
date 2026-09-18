import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getTeamById, updateTeam } from '../../store/teams/getTeamSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getCompetitions } from '../../store/competitionsSlice';

const EditTeam = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { team = {}, loading } = useSelector((state) => state.team);
  const { user: currentUser } = useSelector((state) => state.auth);
  const { competitions = [], loading: competitionsLoading = false } = useSelector(
    (state) => state.competitions || {},
  );
  const canAssignCompetition =
    currentUser?.profile?.name === 'ADMIN' ||
    currentUser?.profile?.name === 'SUPER_ADMIN';
  const leagueOptions = competitions.filter(
    (c) => c.isActive !== false && (!c.type || c.type === 'league'),
  );

  const [formData, setFormData] = useState({
    name: '',
    competitionId: '',
    isActive: true,
    sellsTickets: false,
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewBlob, setLogoPreviewBlob] = useState('');
  const [logoInputKey, setLogoInputKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getTeamById(id));
    }
    if (canAssignCompetition) {
      dispatch(getCompetitions());
    }
  }, [dispatch, id, canAssignCompetition]);

  useEffect(() => {
    if (team?.id) {
      setFormData({
        name: team.name || '',
        competitionId: team.competitionId || '',
        isActive: team.isActive !== false,
        sellsTickets: Boolean(team.sellsTickets),
      });
    }
  }, [team?.id, team?.name, team?.competitionId, team?.isActive, team?.sellsTickets]);

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
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
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

    if (canAssignCompetition && !formData.competitionId) {
      Swal.fire({
        icon: 'error',
        title: 'Validación',
        text: 'Debes seleccionar la liga del equipo.',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      fd.append('name', nameTrim);
      fd.append('isActive', String(Boolean(formData.isActive)));
      fd.append('sellsTickets', String(Boolean(formData.sellsTickets)));
      if (canAssignCompetition && formData.competitionId) {
        fd.append('competitionId', formData.competitionId);
      }
      if (logoFile) {
        fd.append('file', logoFile);
      }

      await dispatch(updateTeam({ teamId: team.id, formData: fd })).unwrap();
      dispatch(getTeams());

      Swal.fire({
        icon: 'success',
        title: 'Equipo actualizado',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        navigate('/teams');
      });
    } catch {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el equipo.',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
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
        <div className="alert alert-warning">No se encontró el equipo.</div>
        <ButtonNavigation url="/teams" icon="bi bi-arrow-left" text="Volver" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Editar equipo</h4>
          <ButtonNavigation url="/teams" icon="bi bi-arrow-left" text="Volver" />
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

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Liga {canAssignCompetition ? '*' : ''}</label>
              {canAssignCompetition ? (
                <>
                  <select
                    className="form-select"
                    name="competitionId"
                    value={formData.competitionId}
                    onChange={handleChange}
                    disabled={competitionsLoading || isSubmitting}
                  >
                    <option value="">
                      {competitionsLoading ? 'Cargando ligas...' : 'Selecciona la liga'}
                    </option>
                    {leagueOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                        {c.season ? ` — ${c.season}` : ''}
                      </option>
                    ))}
                    {formData.competitionId &&
                      !leagueOptions.some((c) => c.id === formData.competitionId) && (
                        <option value={formData.competitionId}>
                          {team.competition?.name
                            ? `${team.competition.name}${team.competition.season ? ` — ${team.competition.season}` : ''}`
                            : formData.competitionId}
                        </option>
                      )}
                  </select>
                  <small className="text-muted d-block mt-1">
                    Puedes reasignar el equipo a otra liga. Si cambia de liga, se quita el grupo actual.
                  </small>
                </>
              ) : (
                <input
                  type="text"
                  className="form-control"
                  value={
                    team.competition?.name
                      ? `${team.competition.name}${team.competition.season ? ` — ${team.competition.season}` : ''}`
                      : team.competitionId || '—'
                  }
                  disabled
                />
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Nombre del equipo *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                maxLength={50}
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Cambiar logo (opcional)</label>
              <input
                key={logoInputKey}
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleLogoFile}
                disabled={isSubmitting}
              />
            </div>

            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="editTeamActiveSwitch"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="editTeamActiveSwitch">
                  Equipo activo
                </label>
              </div>
            </div>

            <div className="mb-3">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="editTeamSellsTicketsSwitch"
                  name="sellsTickets"
                  checked={formData.sellsTickets}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                <label className="form-check-label" htmlFor="editTeamSellsTicketsSwitch">
                  Vende boletos
                </label>
              </div>
            </div>

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={isSubmitting || loading}>
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Guardando…
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Guardar cambios
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

export default EditTeam;
