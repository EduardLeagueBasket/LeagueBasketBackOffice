import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getMyNationalTeam } from '../../store/nationalTeams/getMyNationalTeamSlice';
import { getNationalTeams } from '../../store/nationalTeams/getNationalTeamsSlice';
import { createNationalGame } from '../../store/nationalGames/createNationalGameSlice';
import { nationalGameTypes } from '../../utils/gameTypes';
import {
  isRegionalStaff,
  isRegionalTeam,
  isRepresentativeStaff,
  representativeTeamLabel,
  resolveMyTeam,
} from '../../utils/representativeTeam';

export default function AddNationalGame() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const regionalCopy = isRegionalStaff(user);
  const staffUser = isRepresentativeStaff(user);

  const { myNationalTeam, loading: myNationalTeamLoading } = useSelector(state => state.myNationalTeam);
  const { nationalTeams = [], loading: teamsLoading } = useSelector((state) => state.nationalTeams || {});
  const myTeam = resolveMyTeam(myNationalTeam);

  const [formData, setFormData] = useState({
    nationalTeamId: '',
    opponentName: '',
    gameDate: '',
    gameTime: '',
    location: '',
    gameType: '',
  });

  const selectedTeam = staffUser
    ? myTeam
    : nationalTeams.find((t) => t.id === formData.nationalTeamId);
  const teamIsRegional = regionalCopy || isRegionalTeam(selectedTeam);
  const loadingTeams = staffUser ? myNationalTeamLoading : teamsLoading;

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (staffUser) {
      dispatch(getMyNationalTeam());
    } else {
      dispatch(getNationalTeams());
    }
  }, [dispatch, staffUser]);

  useEffect(() => {
    if (staffUser && myTeam?.id) {
      setFormData((prev) =>
        prev.nationalTeamId === myTeam.id
          ? prev
          : { ...prev, nationalTeamId: myTeam.id },
      );
    }
  }, [staffUser, myTeam?.id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nationalTeamId) {
      newErrors.nationalTeamId = 'Debe seleccionar un equipo';
    }

    if (!formData.opponentName.trim()) {
      newErrors.opponentName = 'El nombre del rival es requerido';
    } else if (formData.opponentName.trim().length < 2) {
      newErrors.opponentName = 'El nombre del rival debe tener al menos 2 caracteres';
    }

    if (!formData.gameDate) {
      newErrors.gameDate = 'La fecha del juego es requerida';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    if (!formData.gameType) {
      newErrors.gameType = 'Debe seleccionar el tipo de juego';
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
      // Combinar fecha y hora
      const gameDateTime = new Date(
        `${formData.gameDate}T${formData.gameTime || '00:00'}`,
      );

      await dispatch(
        createNationalGame({
          nationalTeamId: formData.nationalTeamId,
          opponentName: formData.opponentName.trim(),
          matchDateIso: gameDateTime.toISOString(),
          venue: formData.location.trim(),
          competitionName: formData.gameType,
          status: 'scheduled',
        }),
      ).unwrap();

      Swal.fire({
        icon: 'success',
        title: teamIsRegional
          ? 'Juego regional creado correctamente'
          : 'Juego nacional creado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        // Limpiar formulario después del éxito
        setFormData({
          nationalTeamId: myTeam?.id || '',
          opponentName: '',
          gameDate: '',
          gameTime: '',
          location: '',
          gameType: '',
        });
        setErrors({});
      });

    } catch (error) {
      console.error('Error creando juego:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error creando el juego. Intenta nuevamente.',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      nationalTeamId: myTeam?.id || '',
      opponentName: '',
      gameDate: '',
      gameTime: '',
      location: '',
      gameType: '',
    });
    setErrors({});
  };

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>{teamIsRegional ? 'Crear juego regional' : 'Crear juego nacional'}</h4>
          <ButtonNavigation url="/national-games" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">
                  {teamIsRegional ? 'Equipo regional *' : 'Equipo nacional *'}
                </label>
                <select
                  className={`form-select ${errors.nationalTeamId ? 'is-invalid' : ''}`}
                  name="nationalTeamId"
                  value={formData.nationalTeamId}
                  onChange={handleChange}
                  disabled={staffUser || loadingTeams || isSubmitting}
                >
                  <option value="">
                    {loadingTeams ? 'Cargando equipo...' : 'Selecciona un equipo'}
                  </option>
                  {(staffUser ? (myTeam?.id ? [myTeam] : []) : nationalTeams).map(
                    (team) => (
                      <option key={team.id} value={team.id}>
                        {representativeTeamLabel(team)}
                      </option>
                    ),
                  )}
                </select>
                {errors.nationalTeamId && (
                  <div className="invalid-feedback">
                    {errors.nationalTeamId}
                  </div>
                )}
                {loadingTeams && (
                  <small className="text-muted">
                    <ClipLoader color="#007bff" size={12} /> Cargando equipo...
                  </small>
                )}
                {staffUser && !loadingTeams && !myTeam?.id && (
                  <small className="text-danger">
                    No tienes un equipo asignado. Pide a un admin que te asigne uno.
                  </small>
                )}
              </div>

              <div className="col-md-6 mb-3">
                <label className="form-label">Rival *</label>
                <input
                  type="text"
                  className={`form-control ${errors.opponentName ? 'is-invalid' : ''}`}
                  name="opponentName"
                  value={formData.opponentName}
                  onChange={handleChange}
                  placeholder={teamIsRegional ? 'Ej: Caracas' : 'Ej: Estados Unidos'}
                  disabled={isSubmitting}
                />
                {errors.opponentName && (
                  <div className="invalid-feedback">
                    {errors.opponentName}
                  </div>
                )}
              </div>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Fecha del Juego *</label>
                <input
                  type="date"
                  className={`form-control ${errors.gameDate ? 'is-invalid' : ''}`}
                  name="gameDate"
                  value={formData.gameDate}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
                {errors.gameDate && (
                  <div className="invalid-feedback">
                    {errors.gameDate}
                  </div>
                )}
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Hora del Juego</label>
                <input
                  type="time"
                  className="form-control"
                  name="gameTime"
                  value={formData.gameTime}
                  onChange={handleChange}
                  disabled={isSubmitting}
                />
              </div>

              <div className="col-md-4 mb-3">
                <label className="form-label">Tipo de Juego *</label>
                <select
                  className={`form-select ${errors.gameType ? 'is-invalid' : ''}`}
                  name="gameType"
                  value={formData.gameType}
                  onChange={handleChange}
                  disabled={isSubmitting}
                >
                  <option value="">Selecciona el tipo de juego</option>
                  {nationalGameTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.gameType && (
                  <div className="invalid-feedback">
                    {errors.gameType}
                  </div>
                )}
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Ubicación *</label>
              <input
                type="text"
                className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder={teamIsRegional ? 'Ej: Maracaibo, Zulia' : 'Ej: Madrid, España'}
                disabled={isSubmitting}
              />
              {errors.location && (
                <div className="invalid-feedback">
                  {errors.location}
                </div>
              )}
            </div>

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
                disabled={isSubmitting || loadingTeams || (staffUser && !myTeam?.id)}
              >
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Creando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-plus-lg me-2"></i>
                    Crear juego
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 