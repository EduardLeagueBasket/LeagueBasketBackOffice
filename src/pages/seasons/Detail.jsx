import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getTeams } from '../../store/teams/listTeamsSlice';
import {
  getSeasonTeams,
  setSeasonTeams,
} from '../../store/seasons/seasonsSlice';
import {
  SEASON_STATUS_LABEL,
  seasonStatusOf,
} from '../../utils/seasonApi';

export default function SeasonDetail() {
  const { id: seasonId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const seasonFromState = location.state?.season;
  const competitionId =
    location.state?.competitionId || seasonFromState?.competitionId || '';

  const { seasonTeams = [], teamsLoading, saving, error } = useSelector(
    (s) => s.seasons,
  );
  const { teams = [], loading: teamsListLoading } = useSelector(
    (s) => s.teamsList || {},
  );
  const user = useSelector((s) => s.auth.user);
  const canManage =
    user?.profile?.name === 'ADMIN' ||
    user?.profile?.name === 'SUPER_ADMIN' ||
    user?.profile?.name === 'MANAGER_LEAGUE';

  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (canManage) {
      dispatch(getTeams());
      dispatch(getSeasonTeams(seasonId));
    }
  }, [dispatch, canManage, seasonId]);

  const competitionTeams = useMemo(() => {
    if (!competitionId) return teams;
    return teams.filter((t) => t.competitionId === competitionId);
  }, [teams, competitionId]);

  useEffect(() => {
    setSelectedIds(seasonTeams.map((st) => st.teamId));
  }, [seasonTeams]);

  const toggleTeam = (teamId) => {
    setSelectedIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const handleSave = async () => {
    const result = await dispatch(
      setSeasonTeams({ seasonId, teamIds: selectedIds }),
    );
    if (setSeasonTeams.fulfilled.match(result)) {
      Swal.fire({
        icon: 'success',
        title: 'Equipos inscritos',
        text: `${selectedIds.length} equipo(s) en esta temporada.`,
        confirmButtonText: 'Aceptar',
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron guardar los equipos de la temporada.',
      });
    }
  };

  if (!canManage) {
    return (
      <div className="container py-4">
        <p>No tienes permiso para ver esta sección.</p>
      </div>
    );
  }

  const status = seasonFromState ? seasonStatusOf(seasonFromState) : null;

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="mb-0">
              Equipos de la temporada
              {seasonFromState?.name ? `: ${seasonFromState.name}` : ''}
            </h4>
            {status && (
              <small className="text-muted">
                Estado: {SEASON_STATUS_LABEL[status] || status}
              </small>
            )}
          </div>
          <ButtonNavigation
            url="/seasons"
            icon="bi bi-arrow-left"
            text="Volver"
          />
        </div>

        <div className="card-body">
          <p className="text-muted">
            Marca los equipos que participan en esta edición. Los equipos
            siguen existiendo en el catálogo de la liga; aquí solo defines la
            nómina de esta temporada.
          </p>

          {(teamsLoading || teamsListLoading) && <p>Cargando equipos…</p>}
          {error && (
            <div className="alert alert-danger">
              Error: {JSON.stringify(error)}
            </div>
          )}

          {!teamsLoading && !teamsListLoading && competitionTeams.length === 0 && (
            <div className="alert alert-warning">
              No hay equipos en esta competencia. Crea equipos primero en{' '}
              <button
                type="button"
                className="btn btn-link p-0 align-baseline"
                onClick={() => navigate('/teams/add')}
              >
                Equipos
              </button>
              .
            </div>
          )}

          {competitionTeams.length > 0 && (
            <>
              <div className="mb-3">
                <strong>{selectedIds.length}</strong> seleccionado(s) de{' '}
                {competitionTeams.length}
              </div>
              <div className="list-group mb-4">
                {competitionTeams.map((team) => {
                  const checked = selectedIds.includes(team.id);
                  return (
                    <label
                      key={team.id}
                      className="list-group-item list-group-item-action d-flex align-items-center gap-3"
                    >
                      <input
                        type="checkbox"
                        className="form-check-input m-0"
                        checked={checked}
                        onChange={() => toggleTeam(team.id)}
                        disabled={saving}
                      />
                      {team.logo ? (
                        <img
                          src={team.logo}
                          alt=""
                          style={{
                            width: 32,
                            height: 32,
                            objectFit: 'cover',
                            borderRadius: 4,
                          }}
                        />
                      ) : (
                        <span
                          className="bg-light d-inline-flex align-items-center justify-content-center rounded"
                          style={{ width: 32, height: 32 }}
                        >
                          <i className="bi bi-shield" />
                        </span>
                      )}
                      <span>{team.name}</span>
                      {team.isActive === false && (
                        <span className="badge bg-secondary ms-auto">
                          Inactivo
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>

              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Guardando…' : 'Guardar inscripción'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedIds(competitionTeams.map((t) => t.id))}
                  disabled={saving}
                >
                  Seleccionar todos
                </button>
                <button
                  type="button"
                  className="btn btn-outline-secondary"
                  onClick={() => setSelectedIds([])}
                  disabled={saving}
                >
                  Limpiar
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
