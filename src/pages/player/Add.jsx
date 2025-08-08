import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { ClipLoader } from "react-spinners";
import { fetchCountries } from '../../store/country/countrySlice';
import { basketballPositions } from '../../utils/positions';
import { createPlayer } from '../../store/player/createPlayerSlice';
import { getTeams } from '../../store/teams/getTeamSlice';
import { getNationalTeams } from '../../store/nationalTeams/getNationalTeamsSlice';

const PlayerCreate = () => {
  const dispatch = useDispatch();
  const { user: currentUser } = useSelector((state) => state.auth);
  const { countries = [], loading: countriesLoading } = useSelector(state => state.countries);
  const { teams = [] } = useSelector(state => state.team);
  const { nationalTeams = [] } = useSelector(state => state.nationalTeams);

  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    position: '',
    jerseyNumber: '',
    heightCm: '',
    weightKg: '',
    birthDate: '',
    nationality: '',
    teamType: '', // 'league' o 'national'
    teamId: '', // ID del equipo seleccionado
  });

  useEffect(() => {
    dispatch(fetchCountries());
    dispatch(getTeams());
    dispatch(getNationalTeams());
  }, [dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Si cambia el tipo de equipo, limpiar el equipo seleccionado
    if (name === 'teamType') {
      setFormData(prev => ({
        ...prev,
        teamId: '',
      }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      Swal.fire({ icon: 'warning', title: 'Nombre y apellido son requeridos' });
      return false;
    }
    if (!formData.position) {
      Swal.fire({ icon: 'warning', title: 'Debe seleccionar la posición' });
      return false;
    }
    if (!formData.jerseyNumber || parseInt(formData.jerseyNumber) <= 0) {
      Swal.fire({ icon: 'warning', title: 'Número de camiseta debe ser mayor a 0' });
      return false;
    }
    if (formData.heightCm && parseInt(formData.heightCm) < 100) {
      Swal.fire({ icon: 'warning', title: 'La altura debe ser mayor a 100 cm' });
      return false;
    }
    if (!formData.nationality) {
      Swal.fire({ icon: 'warning', title: 'Debe seleccionar la nacionalidad' });
      return false;
    }
    if (!formData.teamType) {
      Swal.fire({ icon: 'warning', title: 'Debe seleccionar el tipo de equipo' });
      return false;
    }
    if (!formData.teamId) {
      Swal.fire({ icon: 'warning', title: 'Debe seleccionar un equipo' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const payload = {
        ...formData,
        jerseyNumber: parseInt(formData.jerseyNumber),
        heightCm: formData.heightCm ? parseInt(formData.heightCm) : null,
        weightKg: formData.weightKg ? parseInt(formData.weightKg) : null,
        birthDate: formData.birthDate ? new Date(formData.birthDate) : null,
        file: imageFile,
        teamType: formData.teamType,
        teamId: formData.teamId,
      };

      if (imageFile) {
        // Aquí puedes subir la imagen a tu backend o Firebase Storage y obtener la URL
        // Ejemplo:
        // const imageUrl = await uploadImageToStorage(imageFile);
        // payload.photoUrl = imageUrl;
      }

      await dispatch(createPlayer(payload));

      Swal.fire({
        icon: 'success',
        title: 'Jugador creado correctamente',
        confirmButtonText: 'Aceptar',
      });

      setFormData({
        firstName: '',
        lastName: '',
        position: '',
        jerseyNumber: '',
        heightCm: '',
        weightKg: '',
        birthDate: '',
        nationality: '',
        teamType: '',
        teamId: '',
      });
      setImageFile(null);
      setImagePreview(null);

    } catch (error) {
      console.error('Error creando jugador:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo crear el jugador. Intenta nuevamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getTeamOptions = () => {
    if (formData.teamType === 'league') {
      return teams.map(team => (
        <option key={team.id} value={team.id}>
          {team.name}
        </option>
      ));
    } else if (formData.teamType === 'national') {
      return nationalTeams.map(team => (
        <option key={team.id} value={team.id}>
          {team.name} ({team.country})
        </option>
      ));
    }
    return [];
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header">
          <h4>Registrar Nuevo Jugador</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {/* Imagen del jugador */}
            <div className="mb-3 text-center">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview jugador"
                  className="img-thumbnail mb-2"
                  style={{ maxWidth: '150px', maxHeight: '150px' }}
                />
              ) : (
                <p className="text-muted">No se ha seleccionado imagen</p>
              )}
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleImageChange}
              />
              <small className="text-muted">Opcional: Imagen del jugador</small>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Nombre</label>
                <input
                  type="text"
                  className="form-control"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Apellido</label>
                <input
                  type="text"
                  className="form-control"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Posición</label>
              <select
                className="form-select"
                name="position"
                value={formData.position}
                onChange={handleChange}
              >
                <option value="">Selecciona una posición</option>
                {basketballPositions.map(pos => (
                  <option key={pos.value} value={pos.value}>
                    {pos.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label">Número de camiseta</label>
                <input
                  type="number"
                  className="form-control"
                  name="jerseyNumber"
                  value={formData.jerseyNumber}
                  onChange={handleChange}
                  min="1"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Altura (cm)</label>
                <input
                  type="number"
                  className="form-control"
                  name="heightCm"
                  value={formData.heightCm}
                  onChange={handleChange}
                  min="100"
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label">Peso (kg)</label>
                <input
                  type="number"
                  className="form-control"
                  name="weightKg"
                  value={formData.weightKg}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Fecha de nacimiento</label>
              <input
                type="date"
                className="form-control"
                name="birthDate"
                value={formData.birthDate}
                onChange={handleChange}
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Nacionalidad</label>
              <select
                className="form-select"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                disabled={countriesLoading}
              >
                <option value="">Selecciona un país</option>
                {countries.map(country => (
                  <option key={country.code} value={country.demonym || country.name}>
                    {country.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Nuevos campos para tipo de equipo */}
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Tipo de Equipo *</label>
                <select
                  className="form-select"
                  name="teamType"
                  value={formData.teamType}
                  onChange={handleChange}
                >
                  <option value="">Selecciona el tipo de equipo</option>
                  <option value="league">Equipo de Liga</option>
                  <option value="national">Selección Nacional</option>
                </select>
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Equipo *</label>
                <select
                  className="form-select"
                  name="teamId"
                  value={formData.teamId}
                  onChange={handleChange}
                  disabled={!formData.teamType}
                >
                  <option value="">
                    {formData.teamType
                      ? `Selecciona un ${formData.teamType === 'league' ? 'equipo de liga' : 'equipo nacional'}`
                      : 'Primero selecciona el tipo de equipo'
                    }
                  </option>
                  {getTeamOptions()}
                </select>
              </div>
            </div>

            <div className="d-grid gap-2">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <ClipLoader color="#fff" size={16} />
                ) : (
                  <>
                    <i className="bi bi-plus-circle"></i> Crear Jugador
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

export default PlayerCreate;
