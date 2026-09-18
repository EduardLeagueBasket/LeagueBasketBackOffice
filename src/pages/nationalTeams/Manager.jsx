import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { adminPath, apiGet, apiPost } from '../../api/api';
import { formatErrorForDisplay } from '../../utils/apiErrorMessage';
import { getCatalogCountries } from '../../store/catalogCountriesSlice';

export default function NationalTeamManagerHome() {
  const { user } = useSelector((s) => s.auth);
  const { countries = [], loading: countriesLoading = false } = useSelector(
    (s) => s.catalogCountries || {},
  );
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    name: '',
    countryId: '',
    countryCode: '',
    gender: 'male',
    category: 'senior',
  });

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getCatalogCountries());
  }, [dispatch]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError('');
      try {
        const resp = await apiGet(adminPath('/national-teams/teams/me'));
        setTeam(resp?.id ? resp : null);
      } catch (err) {
        const msg = formatErrorForDisplay(err);
        setError(msg);
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, []);

  const handleCreateMine = async () => {
    setCreating(true);
    try {
      const payload = {
        name: form.name.trim(),
        countryCode: form.countryCode.trim().toUpperCase(),
        countryId: form.countryId,
        gender: form.gender,
        category: form.category,
      };

      const created = await apiPost(adminPath('/national-teams/teams/me'), payload);
      setTeam(created);
      setError('');
      Swal.fire({ icon: 'success', title: 'Selección creada y asignada' });
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-4 text-center">
        <ClipLoader color="#007bff" size={48} />
        <p className="mt-3">Cargando tu selección…</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header">
          <h4 className="mb-0">Mi selección nacional</h4>
        </div>
        <div className="card-body">
          {!team?.id ? (
            <>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="alert alert-warning">
                No tienes una selección asignada.
              </div>

              {user?.profile?.name === 'MANAGER_NATIONAL_TEAM' && (
                <div className="border rounded p-3">
                  <div className="fw-bold mb-2">Crear mi selección (self-serve)</div>
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label">Nombre *</label>
                      <input
                        className="form-control"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        disabled={creating}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label">País *</label>
                      <select
                        className="form-select"
                        value={form.countryId}
                        onChange={(e) => {
                          const country = countries.find((c) => c.id === e.target.value);
                          setForm({
                            ...form,
                            countryId: e.target.value,
                            countryCode: (country?.countryCode || '').toUpperCase(),
                          });
                        }}
                        disabled={creating || countriesLoading}
                      >
                        <option value="">
                          {countriesLoading ? 'Cargando países...' : 'Selecciona un país'}
                        </option>
                        {countries
                          .filter((c) => c.isActive !== false)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name || c.countryName} ({c.countryCode})
                            </option>
                          ))}
                      </select>
                      <small className="text-muted">
                        Si el país no aparece, un administrador debe crearlo primero en Países.
                      </small>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Género *</label>
                      <select
                        className="form-select"
                        value={form.gender}
                        onChange={(e) => setForm({ ...form, gender: e.target.value })}
                        disabled={creating}
                      >
                        <option value="male">male</option>
                        <option value="female">female</option>
                        <option value="mixed">mixed</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label">Categoría *</label>
                      <select
                        className="form-select"
                        value={form.category}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            category: e.target.value,
                          })
                        }
                        disabled={creating}
                      >
                        <option value="senior">senior</option>
                        <option value="u23">u23</option>
                        <option value="u19">u19</option>
                        <option value="u17">u17</option>
                        <option value="three_x_three">three_x_three</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-primary mt-3"
                    onClick={handleCreateMine}
                    disabled={creating || !form.name.trim() || !form.countryId}
                  >
                    {creating ? 'Creando…' : 'Crear y asignar'}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="d-flex align-items-center justify-content-between w-100">
              <div className="d-flex align-items-center gap-3">
                {team.logo ? (
                  <img
                    src={team.logo}
                    alt="Logo"
                    className="rounded-circle"
                    style={{ width: 56, height: 56, objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="rounded-circle bg-secondary d-flex align-items-center justify-content-center"
                    style={{ width: 56, height: 56 }}
                  >
                    <i className="bi bi-flag text-white fs-4"></i>
                  </div>
                )}

                <div>
                  <div className="fw-bold">{team.name}</div>

                  <div className="text-muted">
                    {team.countryCode} • {team.gender} • {team.category}
                  </div>

                  <div className="text-muted small">
                    Usuario: {user?.email}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
