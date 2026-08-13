import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Swal from 'sweetalert2';
import { getTeamByManager } from '../../store/teams/getTeamSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import {
  createManagerLeagueGame,
  getManagerLeagueGames,
} from '../../store/leagueGames/managerLeagueGamesSlice';
import { leagueMatchTypes } from '../../utils/leagueMatchApi';
import { formatErrorForDisplay } from '../../utils/apiErrorMessage';

export default function ManagerLeagueGameAdd() {
  const dispatch = useDispatch();
  const { team = {}, loading: teamLoading } = useSelector((s) => s.team);
  const { teams = [] } = useSelector((s) => s.teamsList || {});
  const { list = [], loading, saving } = useSelector((s) => s.managerLeagueGames);

  const [form, setForm] = useState({
    awayTeamId: '',
    awayTeamName: '',
    matchType: 'FRIENDLY',
    matchDate: '',
    matchTime: '19:00',
    venue: '',
  });

  useEffect(() => {
    dispatch(getTeamByManager());
    dispatch(getManagerLeagueGames());
  }, [dispatch]);

  useEffect(() => {
    if (team?.competitionId) {
      dispatch(getTeams());
    }
  }, [dispatch, team?.competitionId]);

  const rivals = teams.filter(
    (t) => t.competitionId === team.competitionId && t.id !== team.id,
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!team?.id) {
      Swal.fire({ icon: 'error', title: 'No tienes equipo asignado' });
      return;
    }
    if (!form.matchDate) {
      Swal.fire({ icon: 'error', title: 'Indica la fecha del partido' });
      return;
    }
    if (!form.awayTeamId && !form.awayTeamName.trim()) {
      Swal.fire({ icon: 'error', title: 'Indica el rival' });
      return;
    }

    const dt = new Date(`${form.matchDate}T${form.matchTime || '00:00'}:00`);

    try {
      await dispatch(
        createManagerLeagueGame({
          competitionId: team.competitionId,
          homeTeamId: team.id,
          awayTeamId: form.awayTeamId || undefined,
          awayTeamName: form.awayTeamName.trim() || undefined,
          matchType: form.matchType,
          matchDateIso: dt.toISOString(),
          status: 'SCHEDULED',
          venue: form.venue || undefined,
        }),
      ).unwrap();

      Swal.fire({ icon: 'success', title: 'Partido registrado' });
      setForm({
        awayTeamId: '',
        awayTeamName: '',
        matchType: 'FRIENDLY',
        matchDate: '',
        matchTime: '19:00',
        venue: '',
      });
      dispatch(getManagerLeagueGames());
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    }
  };

  if (teamLoading) {
    return <div className="container py-4">Cargando equipo…</div>;
  }

  return (
    <div className="container">
      <div className="card shadow mb-4">
        <div className="card-header">
          <h4 className="mb-0">Mis partidos — {team.name || 'Mi equipo'}</h4>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label">Tipo</label>
                <select
                  className="form-select"
                  value={form.matchType}
                  onChange={(e) => setForm({ ...form, matchType: e.target.value })}
                  disabled={saving}
                >
                  {leagueMatchTypes
                    .filter((t) => t.value !== 'LEAGUE')
                    .map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Rival (equipo liga)</label>
                <select
                  className="form-select"
                  value={form.awayTeamId}
                  onChange={(e) => setForm({ ...form, awayTeamId: e.target.value })}
                  disabled={saving}
                >
                  <option value="">Seleccionar…</option>
                  {rivals.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Rival externo</label>
                <input
                  className="form-control"
                  value={form.awayTeamName}
                  onChange={(e) => setForm({ ...form, awayTeamName: e.target.value })}
                  placeholder="Nombre si no está en la liga"
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Fecha *</label>
                <input
                  type="date"
                  className="form-control"
                  value={form.matchDate}
                  onChange={(e) => setForm({ ...form, matchDate: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Hora</label>
                <input
                  type="time"
                  className="form-control"
                  value={form.matchTime}
                  onChange={(e) => setForm({ ...form, matchTime: e.target.value })}
                  disabled={saving}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Sede</label>
                <input
                  className="form-control"
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  disabled={saving}
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary mt-3" disabled={saving}>
              {saving ? 'Guardando…' : 'Registrar partido'}
            </button>
          </form>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-header">
          <h5 className="mb-0">Partidos registrados</h5>
        </div>
        <div className="card-body">
          {loading && <p>Cargando…</p>}
          {!loading && list.length === 0 && (
            <p className="text-muted mb-0">Aún no has registrado partidos.</p>
          )}
          {list.length > 0 && (
            <ul className="list-group">
              {list.map((m) => (
                <li key={m.id} className="list-group-item">
                  <strong>{m.matchType}</strong> —{' '}
                  {new Date(m.matchDate).toLocaleString('es-ES')} vs{' '}
                  {m.awayTeam?.name ?? m.awayTeamName ?? m.awayTeamId}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
