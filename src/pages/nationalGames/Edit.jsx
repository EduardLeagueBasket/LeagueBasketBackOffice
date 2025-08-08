import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ClipLoader } from "react-spinners";
import Swal from 'sweetalert2';
import ButtonNavigation from "../../components/Button/ButtonNavigation";
import { getNationalTeams } from '../../store/nationalTeams/getNationalTeamsSlice';
import { getNationalGameById, updateNationalGame, resetUpdateNationalGameState } from '../../store/nationalGames/updateNationalGameSlice';
import { nationalGameTypes } from '../../utils/gameTypes';

export default function EditNationalGame() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();

  const { nationalTeams = [], loading: teamsLoading } = useSelector(state => state.nationalTeams);
  const { nationalGame, loading, error, success } = useSelector(state => state.updateNationalGame);

  const [formData, setFormData] = useState({
    nationalTeamId: '',
    opponentName: '',
    gameDate: '',
    gameTime: '',
    location: '',
    gameType: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getNationalGameById(id));
    }
    dispatch(getNationalTeams());
  }, [id, dispatch]);

  useEffect(() => {
    if (nationalGame) {
      const gameDate = new Date(nationalGame.gameDate);
      setFormData({
        nationalTeamId: nationalGame.nationalTeamId || '',
        opponentName: nationalGame.opponentName || '',
        gameDate: gameDate.toISOString().split('T')[0],
        gameTime: gameDate.toTimeString().slice(0, 5),
        location: nationalGame.location || '',
        gameType: nationalGame.gameType || '',
      });
    }
  }, [nationalGame]);

  useEffect(() => {
    if (success) {
      Swal.fire({
        icon: 'success',
        title: 'Juego nacional actualizado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => {
        dispatch(resetUpdateNationalGameState());
        navigate('/national-games');
      });
    }
  }, [success, dispatch, navigate]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nationalTeamId) {
      newErrors.nationalTeamId = 'Debe seleccionar un equipo nacional';
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
      const gameDateTime = new Date(formData.gameDate + 'T' + (formData.gameTime || '00:00'));

      const payload = {
        nationalTeamId: formData.nationalTeamId,
        opponentName: formData.opponentName.trim(),
        gameDate: gameDateTime.toISOString(),
        location: formData.location.trim(),
        gameType: formData.gameType,
      };

      console.log('Payload a enviar:', payload);

      await dispatch(updateNationalGame({ id, data: payload })).unwrap();

    } catch (error) {
      console.error('Error actualizando juego nacional:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error actualizando juego nacional. Intenta nuevamente.',
        confirmButtonText: 'Aceptar',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate('/national-games');
  };

  if (loading && !nationalGame) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <ClipLoader color="#007bff" size={50} />
            <p className="mt-3">Cargando juego nacional...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !nationalGame) {
    return (
      <div className="container">
        <div className="card">
          <div className="card-body text-center">
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              Error al cargar el juego nacional: {error}
            </div>
            <ButtonNavigation url="/national-games" icon="bi bi-arrow-left" text="Volver" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Editar Juego Nacional</h4>
          <ButtonNavigation url="/national-games" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Equipo Nacional *</label>
                <select
                  className={`form-select ${errors.nationalTeamId ? 'is-invalid' : ''}`}
                  name="nationalTeamId"
                  value={formData.nationalTeamId}
                  onChange={handleChange}
                  disabled={teamsLoading || isSubmitting}
                >
                  <option value="">Selecciona un equipo nacional</option>
                  {nationalTeams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name} ({team.country})
                    </option>
                  ))}
                </select>
                {errors.nationalTeamId && (
                  <div className="invalid-feedback">
                    {errors.nationalTeamId}
                  </div>
                )}
                {teamsLoading && (
                  <small className="text-muted">
                    <ClipLoader color="#007bff" size={12} /> Cargando equipos...
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
                  placeholder="Ej: Estados Unidos"
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
                placeholder="Ej: Madrid, España"
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
                disabled={isSubmitting || teamsLoading}
              >
                {isSubmitting ? (
                  <>
                    <ClipLoader color="#fff" size={16} className="me-2" />
                    Actualizando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg me-2"></i>
                    Actualizar Juego Nacional
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