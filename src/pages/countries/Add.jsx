import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { ClipLoader } from 'react-spinners';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { clearCatalogCountriesErrors, createCatalogCountry } from '../../store/catalogCountriesSlice';

const CountryAdd = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { creating = false, createError = null } = useSelector((state) => state.catalogCountries || {});

  const [formData, setFormData] = useState({
    name: '',
    countryName: '',
    countryCode: '',
    file: null,
  });

  useEffect(() => {
    if (createError) dispatch(clearCatalogCountriesErrors());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.name, formData.countryName, formData.countryCode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name.trim(),
        countryName: formData.countryName.trim(),
        countryCode: formData.countryCode.trim().toUpperCase(),
        file: formData.file,
      };

      await dispatch(createCatalogCountry(payload)).unwrap();

      Swal.fire({
        icon: 'success',
        title: 'País creado correctamente',
        confirmButtonText: 'Aceptar',
      }).then(() => navigate('/countries'));
    } catch (err) {
      const msg = typeof err === 'string' ? err : 'No se pudo crear el país.';
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: msg,
        confirmButtonText: 'Aceptar',
      });
    }
  };

  return (
    <div className="container mt-4">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h4>Crear País</h4>
          <ButtonNavigation url="/countries" icon="bi bi-arrow-left" text="Volver" />
        </div>

        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Nombre *</label>
              <input
                type="text"
                className="form-control"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={creating}
                placeholder="Ej: Venezuela"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Country name *</label>
              <input
                type="text"
                className="form-control"
                name="countryName"
                value={formData.countryName}
                onChange={handleChange}
                required
                disabled={creating}
                placeholder="Ej: Bolivarian Republic of Venezuela"
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Código de país *</label>
              <input
                type="text"
                className="form-control"
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                required
                disabled={creating}
                maxLength={5}
                placeholder="Ej: VE"
              />
              <small className="text-muted">Lo normal es ISO-2 (VE, CO, AR...).</small>
            </div>

            <div className="mb-3">
              <label className="form-label">Logo (opcional)</label>
              <input
                type="file"
                className="form-control"
                accept="image/*"
                onChange={handleFileChange}
                disabled={creating}
              />
              <small className="text-muted">
                Si no subes logo, luego lo generas con el country code como dijiste.
              </small>
            </div>

            {createError && (
              <div className="alert alert-danger">
                {typeof createError === 'string' ? createError : 'Error creando país'}
              </div>
            )}

            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-primary" disabled={creating}>
                {creating ? <ClipLoader color="#fff" size={18} /> : 'Crear País'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CountryAdd;

