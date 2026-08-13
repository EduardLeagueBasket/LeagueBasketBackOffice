import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ClipLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { adminPath, apiGet } from '../../api/api';

export default function NationalTeamManagerHome() {
  const { user } = useSelector((s) => s.auth);
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState(null);

  const dispatch = useDispatch(); // reservado para futuras acciones (matches, feed, etc.)

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const resp = await apiGet(adminPath('/national-teams/teams/me'));
        setTeam(resp);
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'No tienes selección asignada',
          text:
            typeof err === 'string'
              ? err
              : 'Pídele a un administrador que te asigne una selección nacional.',
        });
        setTeam(null);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [dispatch]);

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
            <div className="alert alert-warning mb-0">
              No tienes una selección asignada. Contacta a un administrador.
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}

