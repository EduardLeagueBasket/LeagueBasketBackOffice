import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCompetitions } from '../../store/competitionsSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getSeasons } from '../../store/seasons/seasonsSlice';
import { bulkCreateLeagueGames } from '../../store/leagueGames/leagueGamesSlice';
import { formatErrorForDisplay } from '../../utils/apiErrorMessage';
import {
  downloadLeagueMatchesTemplate,
  mapSpreadsheetRowsToMatches,
  parseLeagueMatchesSpreadsheet,
} from '../../utils/leagueMatchesSpreadsheet';

export default function LeagueGamesBulkAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((s) => s.leagueGames);
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { teams = [] } = useSelector((s) => s.teamsList || {});
  const { list: seasons = [] } = useSelector((s) => s.seasons || {});

  const [competitionId, setCompetitionId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  /** Columna de equipo (id/nombre) es local o visitante */
  const [leftSideRole, setLeftSideRole] = useState('home');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    dispatch(getCompetitions());
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    if (competitionId) dispatch(getSeasons({ competitionId }));
  }, [dispatch, competitionId]);

  const competitionTeams = useMemo(
    () => teams.filter((t) => t.competitionId === competitionId),
    [teams, competitionId],
  );

  const { matches, errors: mapErrors } = useMemo(() => {
    if (!competitionId || rawRows.length === 0) {
      return { matches: [], errors: [] };
    }
    return mapSpreadsheetRowsToMatches(rawRows, competitionTeams, leftSideRole);
  }, [rawRows, competitionTeams, leftSideRole, competitionId]);

  const allErrors = [...parseErrors, ...mapErrors];

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!competitionId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona la competición primero',
        text: 'Así podemos validar los nombres/ids de equipo del Excel.',
      });
      return;
    }

    setImporting(true);
    setFileName(file.name);
    try {
      const { rows, errors } = await parseLeagueMatchesSpreadsheet(file);
      setRawRows(rows);
      setParseErrors(errors);
      if (!rows.length && errors.length) {
        Swal.fire({
          icon: 'error',
          title: 'No se pudo leer el Excel',
          html: `<ul style="text-align:left">${errors.map((x) => `<li>${x}</li>`).join('')}</ul>`,
        });
      }
    } catch (err) {
      setRawRows([]);
      setParseErrors([]);
      Swal.fire({
        icon: 'error',
        title: 'Error al leer archivo',
        text: err?.message || 'Archivo inválido',
      });
    } finally {
      setImporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!competitionId) {
      Swal.fire({ icon: 'error', title: 'Selecciona una competición' });
      return;
    }
    if (matches.length === 0) {
      Swal.fire({
        icon: 'error',
        title: 'No hay partidos válidos',
        text: allErrors[0] || 'Carga un Excel con filas válidas.',
      });
      return;
    }

    if (allErrors.length > 0) {
      const confirm = await Swal.fire({
        icon: 'warning',
        title: `${matches.length} válidos, ${allErrors.length} con error`,
        text: '¿Registrar solo los partidos válidos?',
        showCancelButton: true,
        confirmButtonText: 'Sí, continuar',
        cancelButtonText: 'Cancelar',
      });
      if (!confirm.isConfirmed) return;
    }

    try {
      await dispatch(
        bulkCreateLeagueGames({
          competitionId,
          seasonId: seasonId || undefined,
          matches,
        }),
      ).unwrap();
      Swal.fire({
        icon: 'success',
        title: 'Partidos registrados',
        text: `${matches.length} partido(s) creados`,
      }).then(() => navigate('/league-games'));
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: formatErrorForDisplay(err),
      });
    }
  };

  return (
    <div className="container">
      <div className="card shadow">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h4 className="mb-0">Carga masiva — Excel</h4>
          <ButtonNavigation url="/league-games" icon="bi bi-arrow-left" text="Volver" />
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Competición *</label>
                <select
                  className="form-select"
                  value={competitionId}
                  onChange={(e) => {
                    setCompetitionId(e.target.value);
                    setRawRows([]);
                    setParseErrors([]);
                    setFileName('');
                  }}
                  disabled={saving}
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
                <label className="form-label">Temporada</label>
                <select
                  className="form-select"
                  value={seasonId}
                  onChange={(e) => setSeasonId(e.target.value)}
                  disabled={saving || !competitionId}
                >
                  <option value="">Seleccionar…</option>
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                      {s.isActive ? ' (activa)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="border rounded p-3 mb-3 bg-light">
              <h6 className="mb-2">Formato del Excel</h6>
              <p className="small text-muted mb-2">
                Columnas: <code>id</code> (opcional), <code>nombre_equipo</code>,{' '}
                <code>rival</code>, <code>fecha</code>, <code>hora</code>,{' '}
                <code>ubicacion</code> (opcional).
              </p>
              <div className="row g-3 align-items-end">
                <div className="col-md-6">
                  <label className="form-label">
                    La columna del equipo (id / nombre) es…
                  </label>
                  <select
                    className="form-select"
                    value={leftSideRole}
                    onChange={(e) => setLeftSideRole(e.target.value)}
                    disabled={saving}
                  >
                    <option value="home">Local (casa)</option>
                    <option value="away">Visitante</option>
                  </select>
                  <small className="text-muted">
                    {leftSideRole === 'home'
                      ? 'Equipo = local · Rival = visitante'
                      : 'Equipo = visitante · Rival = local (debe existir en la liga)'}
                  </small>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Archivo Excel (.xlsx, .xls, .csv)</label>
                  <input
                    type="file"
                    className="form-control"
                    accept=".xlsx,.xls,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                    onChange={handleFile}
                    disabled={saving || importing || !competitionId}
                  />
                  {fileName && (
                    <small className="text-muted d-block mt-1">{fileName}</small>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary mt-3"
                onClick={downloadLeagueMatchesTemplate}
              >
                Descargar plantilla
              </button>
            </div>

            {allErrors.length > 0 && (
              <div className="alert alert-warning">
                <strong>{allErrors.length} fila(s) con problema</strong>
                <ul className="mb-0 mt-2 small">
                  {allErrors.slice(0, 12).map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                  {allErrors.length > 12 && (
                    <li>…y {allErrors.length - 12} más</li>
                  )}
                </ul>
              </div>
            )}

            {matches.length > 0 && (
              <div className="table-responsive mb-3">
                <table className="table table-sm table-bordered align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>#</th>
                      <th>Local</th>
                      <th>Visitante</th>
                      <th>Fecha</th>
                      <th>Hora</th>
                      <th>Ubicación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {matches.map((m) => (
                      <tr key={`${m.excelRow}-${m.homeTeamId}-${m.awayLabel}`}>
                        <td>{m.excelRow}</td>
                        <td>{m.homeLabel}</td>
                        <td>{m.awayLabel}</td>
                        <td>{m.matchDate}</td>
                        <td>{m.matchTime}</td>
                        <td>{m.venue || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <small className="text-muted">
                  {matches.length} partido(s) listos · {competitionTeams.length}{' '}
                  equipo(s) en la competición
                </small>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving || importing || matches.length === 0}
            >
              {saving
                ? 'Guardando…'
                : importing
                  ? 'Leyendo Excel…'
                  : `Registrar ${matches.length || ''} partido(s)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
