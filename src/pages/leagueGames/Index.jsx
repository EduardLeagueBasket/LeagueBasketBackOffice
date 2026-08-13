import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCompetitions } from '../../store/competitionsSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getSeasons } from '../../store/seasons/seasonsSlice';
import {
  getLeagueGames,
  updateLeagueGame,
} from '../../store/leagueGames/leagueGamesSlice';
import { leagueMatchStatuses, leagueMatchTypes } from '../../utils/leagueMatchApi';

const labelOf = (options, value) =>
  options.find((o) => o.value === value)?.label ?? value;

export default function LeagueGamesIndex() {
  const dispatch = useDispatch();
  const { list = [], loading, saving, error } = useSelector((s) => s.leagueGames);
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { teams = [] } = useSelector((s) => s.teamsList || {});
  const { list: seasons = [] } = useSelector((s) => s.seasons || {});
  const user = useSelector((s) => s.auth.user);
  const isAdmin =
    user?.profile?.name === 'ADMIN' ||
    user?.profile?.name === 'SUPER_ADMIN' ||
    user?.profile?.name === 'MANAGER_LEAGUE' ||
    user?.profile?.name === 'ASISTANT_LEAGUE';

  const [competitionId, setCompetitionId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    status: 'SCHEDULED',
    homeScore: '',
    awayScore: '',
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(getCompetitions());
      dispatch(getTeams());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    if (isAdmin && competitionId) {
      dispatch(getSeasons({ competitionId }));
    }
  }, [dispatch, isAdmin, competitionId]);

  useEffect(() => {
    if (isAdmin && competitionId) {
      dispatch(getLeagueGames({ competitionId, seasonId: seasonId || undefined }));
    }
  }, [dispatch, isAdmin, competitionId, seasonId]);

  const teamNameById = useMemo(() => {
    const map = {};
    teams.forEach((t) => {
      map[t.id] = t.name;
    });
    return map;
  }, [teams]);

  const openEdit = (match) => {
    setEditing(match);
    setEditForm({
      status: match.status,
      homeScore: match.homeScore ?? '',
      awayScore: match.awayScore ?? '',
    });
  };

  const closeEdit = () => setEditing(null);

  const handleSaveResult = async (e) => {
    e.preventDefault();
    const data = {
      status: editForm.status,
      homeScore:
        editForm.homeScore === '' ? null : Number(editForm.homeScore),
      awayScore:
        editForm.awayScore === '' ? null : Number(editForm.awayScore),
    };
    const result = await dispatch(updateLeagueGame({ id: editing.id, data }));
    if (updateLeagueGame.fulfilled.match(result)) {
      closeEdit();
      dispatch(getLeagueGames({ competitionId, seasonId: seasonId || undefined }));
    }
  };

  if (!isAdmin) {
    return (
      <div className="container py-4">
        <p>No tienes permiso para ver esta sección.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0">Juegos de liga</h4>
          <div className="d-flex gap-2">
            <ButtonNavigation
              url="/league-games/bulk"
              icon="bi bi-upload"
              text="Carga masiva"
            />
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label">Competición</label>
              <select
                className="form-select"
                value={competitionId}
                onChange={(e) => {
                  setCompetitionId(e.target.value);
                  setSeasonId('');
                }}
              >
                <option value="">Seleccionar…</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Temporada (opcional)</label>
              <select
                className="form-select"
                value={seasonId}
                onChange={(e) => setSeasonId(e.target.value)}
                disabled={!competitionId}
              >
                <option value="">Todas</option>
                {seasons.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loading && <p>Cargando partidos…</p>}
          {error && (
            <div className="alert alert-danger">
              Error al cargar: {JSON.stringify(error)}
            </div>
          )}

          {!loading && competitionId && list.length === 0 && (
            <p className="text-muted">No hay partidos registrados para esta liga.</p>
          )}

          {list.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped align-middle">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Local</th>
                    <th>Visitante</th>
                    <th>Marcador</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th>Sede</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.matchDate).toLocaleString('es-ES')}</td>
                      <td>
                        {m.homeTeam?.name ?? teamNameById[m.homeTeamId] ?? m.homeTeamId}
                      </td>
                      <td>
                        {m.awayTeam?.name ?? m.awayTeamName ?? teamNameById[m.awayTeamId] ?? '—'}
                      </td>
                      <td>
                        {m.homeScore != null && m.awayScore != null
                          ? `${m.homeScore} - ${m.awayScore}`
                          : '—'}
                      </td>
                      <td>{labelOf(leagueMatchTypes, m.matchType)}</td>
                      <td>{labelOf(leagueMatchStatuses, m.status)}</td>
                      <td>{m.venue || '—'}</td>
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => openEdit(m)}
                        >
                          Resultado
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editing && (
        <div className="modal show d-block" tabIndex="-1" style={{ background: 'rgba(0,0,0,0.4)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSaveResult}>
                <div className="modal-header">
                  <h5 className="modal-title">Editar resultado</h5>
                  <button type="button" className="btn-close" onClick={closeEdit} />
                </div>
                <div className="modal-body">
                  <p className="text-muted small">
                    Solo los partidos de tipo Liga finalizados actualizan la tabla de posiciones.
                  </p>
                  <div className="mb-3">
                    <label className="form-label">Estado</label>
                    <select
                      className="form-select"
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, status: e.target.value }))
                      }
                    >
                      {leagueMatchStatuses.map((s) => (
                        <option key={s.value} value={s.value}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label">Puntos local</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.homeScore}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, homeScore: e.target.value }))
                        }
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label">Puntos visitante</label>
                      <input
                        type="number"
                        min="0"
                        className="form-control"
                        value={editForm.awayScore}
                        onChange={(e) =>
                          setEditForm((f) => ({ ...f, awayScore: e.target.value }))
                        }
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={closeEdit}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Guardando…' : 'Guardar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
