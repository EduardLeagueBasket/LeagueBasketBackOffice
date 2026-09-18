import * as XLSX from 'xlsx';

/** Normaliza encabezados para matching flexible. */
export function normalizeHeader(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_');
}

const HEADER_ALIASES = {
  homeId: [
    'id_equipo_home',
    'id_home',
    'home_team_id',
    'home_id',
    'equipo_local_id',
    'id_local',
    'id_equipo_a',
    'id_a',
  ],
  awayId: [
    'id_equipo_away',
    'id_away',
    'away_team_id',
    'away_id',
    'equipo_visitante_id',
    'id_visitante',
    'id_equipo_b',
    'id_b',
  ],
  date: ['fecha', 'date', 'match_date', 'dia'],
  time: ['hora', 'time', 'match_time', 'horario'],
  datetime: ['fecha_hora', 'datetime', 'fecha_y_hora'],
  venue: ['ubicacion', 'sede', 'venue', 'location', 'cancha', 'lugar'],
  matchType: ['tipo', 'match_type', 'tipo_partido'],
  status: ['estado', 'status'],
};

function pickColumn(normalizedHeaders, aliases) {
  for (const alias of aliases) {
    const idx = normalizedHeaders.indexOf(alias);
    if (idx >= 0) return idx;
  }
  return -1;
}

function cellToString(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date) return value.toISOString();
  return String(value).trim();
}

/** Excel serial date → Date local. */
function excelSerialToDate(serial) {
  const n = Number(serial);
  if (!Number.isFinite(n)) return null;
  const utc = Math.round((n - 25569) * 86400 * 1000);
  return new Date(utc);
}

function parseDateValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  if (typeof value === 'number') {
    const dt = excelSerialToDate(value);
    if (!dt || Number.isNaN(dt.getTime())) return '';
    return parseDateValue(dt);
  }
  const raw = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const m = raw.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})/);
  if (m) {
    return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parseDateValue(parsed);
  return '';
}

function parseTimeValue(value) {
  if (value == null || value === '') return '';
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
  }
  if (typeof value === 'number') {
    if (value < 1) {
      const totalMinutes = Math.round(value * 24 * 60);
      const h = Math.floor(totalMinutes / 60) % 24;
      const min = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    }
    const dt = excelSerialToDate(value);
    if (!dt || Number.isNaN(dt.getTime())) return '';
    return parseTimeValue(dt);
  }
  const raw = String(value).trim();
  const m = raw.match(/^(\d{1,2}):(\d{2})/);
  if (m) return `${m[1].padStart(2, '0')}:${m[2]}`;
  return '';
}

/**
 * Resuelve un equipo de la competición por id exacto.
 * @returns {{ id: string, name: string } | null}
 */
export function resolveCompetitionTeamById(teams, teamId) {
  const raw = cellToString(teamId);
  if (!raw) return null;
  const found = teams.find((t) => String(t.id) === raw);
  return found ? { id: found.id, name: found.name } : null;
}

/**
 * Lee un File Excel (.xlsx/.xls/.csv) y devuelve filas crudas + errores de formato.
 */
export function parseLeagueMatchesSpreadsheet(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          resolve({ rows: [], errors: ['El archivo no tiene hojas'] });
          return;
        }
        const sheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(sheet, {
          header: 1,
          defval: '',
          raw: true,
        });

        if (!matrix.length) {
          resolve({ rows: [], errors: ['El archivo está vacío'] });
          return;
        }

        const headerRow = matrix[0];
        const normalizedHeaders = headerRow.map(normalizeHeader);
        const cols = {
          homeId: pickColumn(normalizedHeaders, HEADER_ALIASES.homeId),
          awayId: pickColumn(normalizedHeaders, HEADER_ALIASES.awayId),
          date: pickColumn(normalizedHeaders, HEADER_ALIASES.date),
          time: pickColumn(normalizedHeaders, HEADER_ALIASES.time),
          datetime: pickColumn(normalizedHeaders, HEADER_ALIASES.datetime),
          venue: pickColumn(normalizedHeaders, HEADER_ALIASES.venue),
          matchType: pickColumn(normalizedHeaders, HEADER_ALIASES.matchType),
          status: pickColumn(normalizedHeaders, HEADER_ALIASES.status),
        };

        if (cols.homeId < 0 || cols.awayId < 0) {
          resolve({
            rows: [],
            errors: [
              'Faltan columnas de equipos. Usa id_equipo_home e id_equipo_away (UUID de cada equipo).',
            ],
          });
          return;
        }
        if (cols.date < 0 && cols.datetime < 0) {
          resolve({
            rows: [],
            errors: ['Falta la columna de fecha (fecha o fecha_hora).'],
          });
          return;
        }

        const rows = [];
        for (let i = 1; i < matrix.length; i += 1) {
          const line = matrix[i];
          if (!line || line.every((c) => cellToString(c) === '')) continue;

          let matchDate = cols.date >= 0 ? parseDateValue(line[cols.date]) : '';
          let matchTime =
            cols.time >= 0 ? parseTimeValue(line[cols.time]) : '';

          if (
            cols.datetime >= 0 &&
            line[cols.datetime] != null &&
            line[cols.datetime] !== ''
          ) {
            const dtVal = line[cols.datetime];
            if (!matchDate) matchDate = parseDateValue(dtVal);
            if (!matchTime) matchTime = parseTimeValue(dtVal);
          }

          rows.push({
            excelRow: i + 1,
            homeTeamId: cellToString(line[cols.homeId]),
            awayTeamId: cellToString(line[cols.awayId]),
            matchDate,
            matchTime: matchTime || '19:00',
            venue: cols.venue >= 0 ? cellToString(line[cols.venue]) : '',
            matchType:
              cols.matchType >= 0
                ? cellToString(line[cols.matchType]).toUpperCase() || 'LEAGUE'
                : 'LEAGUE',
            status:
              cols.status >= 0
                ? cellToString(line[cols.status]).toUpperCase() || 'SCHEDULED'
                : 'SCHEDULED',
          });
        }

        resolve({ rows, errors: [] });
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('No se pudo leer el archivo'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Mapea filas del Excel a partidos listos para el API.
 * Cada fila debe traer UUID de local y visitante.
 */
export function mapSpreadsheetRowsToMatches(rawRows, competitionTeams) {
  const mapped = [];
  const errors = [];

  rawRows.forEach((row) => {
    if (!row.matchDate) {
      errors.push(`Fila ${row.excelRow}: fecha inválida o vacía`);
      return;
    }

    const homeTeam = resolveCompetitionTeamById(
      competitionTeams,
      row.homeTeamId,
    );
    const awayTeam = resolveCompetitionTeamById(
      competitionTeams,
      row.awayTeamId,
    );

    if (!row.homeTeamId) {
      errors.push(`Fila ${row.excelRow}: falta id_equipo_home`);
      return;
    }
    if (!row.awayTeamId) {
      errors.push(`Fila ${row.excelRow}: falta id_equipo_away`);
      return;
    }
    if (!homeTeam) {
      errors.push(
        `Fila ${row.excelRow}: id_equipo_home "${row.homeTeamId}" no pertenece a esta competición`,
      );
      return;
    }
    if (!awayTeam) {
      errors.push(
        `Fila ${row.excelRow}: id_equipo_away "${row.awayTeamId}" no pertenece a esta competición`,
      );
      return;
    }
    if (homeTeam.id === awayTeam.id) {
      errors.push(
        `Fila ${row.excelRow}: local y visitante no pueden ser el mismo equipo`,
      );
      return;
    }

    const time = row.matchTime || '19:00';
    const dt = new Date(`${row.matchDate}T${time}:00`);
    if (Number.isNaN(dt.getTime())) {
      errors.push(`Fila ${row.excelRow}: fecha/hora inválida`);
      return;
    }

    mapped.push({
      excelRow: row.excelRow,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeLabel: homeTeam.name,
      awayLabel: awayTeam.name,
      matchType: ['LEAGUE', 'FRIENDLY', 'TOURNAMENT', 'INTERNATIONAL'].includes(
        row.matchType,
      )
        ? row.matchType
        : 'LEAGUE',
      status: ['SCHEDULED', 'LIVE', 'FINISHED', 'POSTPONED'].includes(row.status)
        ? row.status
        : 'SCHEDULED',
      matchDate: row.matchDate,
      matchTime: time,
      matchDateIso: dt.toISOString(),
      venue: row.venue || undefined,
      ok: true,
    });
  });

  return { matches: mapped, errors };
}

/**
 * Genera y descarga plantilla Excel.
 * @param {Array<{ id: string, name: string }>} [teams] - si hay equipos, incluye hoja de referencia
 */
export function downloadLeagueMatchesTemplate(teams = []) {
  const sample = [
    {
      id_equipo_home: teams[0]?.id || 'pegar-uuid-local',
      id_equipo_away: teams[1]?.id || 'pegar-uuid-visitante',
      fecha: '2026-09-01',
      hora: '19:00',
      ubicacion: 'Coliseo El Pueblo',
    },
    {
      id_equipo_home: teams[1]?.id || 'pegar-uuid-local',
      id_equipo_away: teams[0]?.id || 'pegar-uuid-visitante',
      fecha: '2026-09-03',
      hora: '20:30',
      ubicacion: 'Arena Manizales',
    },
  ];

  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    book,
    XLSX.utils.json_to_sheet(sample),
    'Partidos',
  );

  if (teams.length > 0) {
    const ref = teams.map((t) => ({
      nombre: t.name,
      id: t.id,
    }));
    XLSX.utils.book_append_sheet(
      book,
      XLSX.utils.json_to_sheet(ref),
      'Equipos',
    );
  }

  XLSX.writeFile(book, 'plantilla-carga-partidos.xlsx');
}
