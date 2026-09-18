import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import ButtonNavigation from '../../components/Button/ButtonNavigation';
import { getCompetitions } from '../../store/competitionsSlice';
import { getTeams } from '../../store/teams/listTeamsSlice';
import { getSeasons, getSeasonTeams } from '../../store/seasons/seasonsSlice';
import { bulkCreateLeagueGames } from '../../store/leagueGames/leagueGamesSlice';
import { formatErrorForDisplay } from '../../utils/apiErrorMessage';
import {
  downloadLeagueMatchesTemplate,
  mapSpreadsheetRowsToMatches,
  parseLeagueMatchesSpreadsheet,
} from '../../utils/leagueMatchesSpreadsheet';
import { SEASON_STATUS_LABEL, seasonStatusOf } from '../../utils/seasonApi';

export default function LeagueGamesBulkAdd() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { saving } = useSelector((s) => s.leagueGames);
  const { competitions = [] } = useSelector((s) => s.competitions || {});
  const { teams = [] } = useSelector((s) => s.teamsList || {});
  const { list: seasons = [], seasonTeams = [] } = useSelector(
    (s) => s.seasons || {},
  );

  const [competitionId, setCompetitionId] = useState('');
  const [seasonId, setSeasonId] = useState('');
  const [fileName, setFileName] = useState('');
  const [rawRows, setRawRows] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [copiedId, setCopiedId] = useState('');

  useEffect(() => {
    dispatch(getCompetitions());
    dispatch(getTeams());
  }, [dispatch]);

  useEffect(() => {
    if (!competitionId && competitions.length === 1) {
      setCompetitionId(competitions[0].id);
    }
  }, [competitions, competitionId]);

  useEffect(() => {
    if (competitionId) dispatch(getSeasons({ competitionId }));
  }, [dispatch, competitionId]);

  useEffect(() => {
    if (seasonId) dispatch(getSeasonTeams(seasonId));
  }, [dispatch, seasonId]);

  /** Todos los equipos de la liga (para copiar UUID). */
  const competitionTeams = useMemo(
    () =>
      teams
        .filter((t) => t.competitionId === competitionId)
        .slice()
        .sort((a, b) => String(a.name).localeCompare(String(b.name), 'es')),
    [teams, competitionId],
  );

  /**
   * Validación del Excel: si hay temporada con inscritos, solo esos;
   * si no, todos los de la competición.
   */
  const validationTeams = useMemo(() => {
    if (!seasonId || seasonTeams.length === 0) return competitionTeams;
    const enrolled = new Set(seasonTeams.map((st) => st.teamId));
    return competitionTeams.filter((t) => enrolled.has(t.id));
  }, [competitionTeams, seasonId, seasonTeams]);

  const { matches, errors: mapErrors } = useMemo(() => {
    if (!competitionId || rawRows.length === 0) {
      return { matches: [], errors: [] };
    }
    return mapSpreadsheetRowsToMatches(rawRows, validationTeams);
  }, [rawRows, validationTeams, competitionId]);

  const allErrors = [...parseErrors, ...mapErrors];

  const copyTeamId = async (id) => {
    try {
      await navigator.clipboard.writeText(id);
      setCopiedId(id);
      setTimeout(() => setCopiedId(''), 1500);
    } catch {
      Swal.fire({
        icon: 'info',
        title: 'Copia manual',
        text: id,
      });
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!competitionId) {
      Swal.fire({
        icon: 'warning',
        title: 'Selecciona la competición primero',
        text: 'Así validamos que los UUID del Excel pertenecen a esa liga.',
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
                    setSeasonId('');
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
                      {SEASON_STATUS_LABEL[seasonStatusOf(s)]
                        ? ` (${SEASON_STATUS_LABEL[seasonStatusOf(s)].toLowerCase()})`
                        : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {competitionId && (
              <div className="border rounded p-3 mb-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-2">
                  <h6 className="mb-0">Equipos de la liga (copia el UUID)</h6>
                  <small className="text-muted">
                    {competitionTeams.length} equipo(s)
                    {seasonId && seasonTeams.length > 0
                      ? ` · ${seasonTeams.length} inscrito(s) en la temporada`
                      : ''}
                  </small>
                </div>
                {competitionTeams.length === 0 ? (
                  <p className="text-muted small mb-0">
                    No hay equipos en esta competición.
                  </p>
                ) : (
                  <div className="table-responsive" style={{ maxHeight: 260 }}>
                    <table className="table table-sm table-hover align-middle mb-0">
                      <thead className="table-light sticky-top">
                        <tr>
                          <th>Equipo</th>
                          <th>ID</th>
                          <th style={{ width: 90 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {competitionTeams.map((t) => (
                          <tr key={t.id}>
                            <td>{t.name}</td>
                            <td>
                              <code className="small user-select-all">{t.id}</code>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => copyTeamId(t.id)}
                              >
                                {copiedId === t.id ? 'Copiado' : 'Copiar'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="border rounded p-3 mb-3 bg-light">
              <h6 className="mb-2">Formato del Excel</h6>
              <p className="small text-muted mb-2">
                Cada fila = un partido. Columnas:{' '}
                <code>id_equipo_home</code>, <code>id_equipo_away</code>,{' '}
                <code>fecha</code>, <code>hora</code>,{' '}
                <code>ubicacion</code> (opcional).
              </p>
              <p className="small text-muted mb-3">
                Pega los UUID del listado de arriba. No uses nombres: evitas
                errores de coincidencia.
              </p>
              <div className="row g-3 align-items-end">
                <div className="col-md-8">
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
                <div className="col-md-4">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={() =>
                      downloadLeagueMatchesTemplate(competitionTeams)
                    }
                    disabled={!competitionId}
                  >
                    Descargar plantilla
                  </button>
                </div>
              </div>
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
                      <tr key={`${m.excelRow}-${m.homeTeamId}-${m.awayTeamId}`}>
                        <td>{m.excelRow}</td>
                        <td>
                          {m.homeLabel}
                          <div>
                            <code className="small text-muted">{m.homeTeamId}</code>
                          </div>
                        </td>
                        <td>
                          {m.awayLabel}
                          <div>
                            <code className="small text-muted">{m.awayTeamId}</code>
                          </div>
                        </td>
                        <td>{m.matchDate}</td>
                        <td>{m.matchTime}</td>
                        <td>{m.venue || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <small className="text-muted">
                  {matches.length} partido(s) listos
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
