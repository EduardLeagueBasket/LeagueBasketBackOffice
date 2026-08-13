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
  id: ['id', 'team_id', 'equipo_id', 'id_equipo', 'home_id', 'teamid'],
  teamName: [
    'nombre',
    'nombre_equipo',
    'equipo',
    'team',
    'team_name',
    'teamname',
    'nombre_del_equipo',
  ],
  rival: [
    'rival',
    'equipo_rival',
    'visitante',
    'local',
    'away',
    'opponent',
    'contrincante',
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
  // Excel epoch (con bug 1900)
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
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  // DD/MM/YYYY or DD-MM-YYYY
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
    // fracción de día
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

function normalizeName(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Resuelve un equipo de la competición por id o nombre.
 * @returns {{ id: string, name: string } | null}
 */
export function resolveCompetitionTeam(teams, idOrName) {
  const raw = cellToString(idOrName);
  if (!raw) return null;
  const byId = teams.find((t) => String(t.id) === raw);
  if (byId) return { id: byId.id, name: byId.name };
  const needle = normalizeName(raw);
  const byName = teams.find((t) => normalizeName(t.name) === needle);
  if (byName) return { id: byName.id, name: byName.name };
  return null;
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
          id: pickColumn(normalizedHeaders, HEADER_ALIASES.id),
          teamName: pickColumn(normalizedHeaders, HEADER_ALIASES.teamName),
          rival: pickColumn(normalizedHeaders, HEADER_ALIASES.rival),
          date: pickColumn(normalizedHeaders, HEADER_ALIASES.date),
          time: pickColumn(normalizedHeaders, HEADER_ALIASES.time),
          datetime: pickColumn(normalizedHeaders, HEADER_ALIASES.datetime),
          venue: pickColumn(normalizedHeaders, HEADER_ALIASES.venue),
          matchType: pickColumn(normalizedHeaders, HEADER_ALIASES.matchType),
          status: pickColumn(normalizedHeaders, HEADER_ALIASES.status),
        };

        if (cols.rival < 0) {
          resolve({
            rows: [],
            errors: [
              'Falta la columna del rival (ej. rival, equipo_rival, visitante).',
            ],
          });
          return;
        }
        if (cols.id < 0 && cols.teamName < 0) {
          resolve({
            rows: [],
            errors: [
              'Falta la columna del equipo (id o nombre_equipo / equipo).',
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

          if (cols.datetime >= 0 && line[cols.datetime] != null && line[cols.datetime] !== '') {
            const dtVal = line[cols.datetime];
            if (!matchDate) matchDate = parseDateValue(dtVal);
            if (!matchTime) matchTime = parseTimeValue(dtVal);
          }

          rows.push({
            excelRow: i + 1,
            teamId: cols.id >= 0 ? cellToString(line[cols.id]) : '',
            teamName: cols.teamName >= 0 ? cellToString(line[cols.teamName]) : '',
            rival: cellToString(line[cols.rival]),
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
 * @param {'home'|'away'} leftSideRole - qué es la columna de equipo (izquierda)
 */
export function mapSpreadsheetRowsToMatches(rawRows, competitionTeams, leftSideRole) {
  const mapped = [];
  const errors = [];

  rawRows.forEach((row) => {
    const teamRef = row.teamId || row.teamName;
    const leftTeam = resolveCompetitionTeam(competitionTeams, teamRef);
    const rivalTeam = resolveCompetitionTeam(competitionTeams, row.rival);

    if (!row.matchDate) {
      errors.push(`Fila ${row.excelRow}: fecha inválida o vacía`);
      return;
    }

    let homeTeamId = '';
    let awayTeamId = '';
    let awayTeamName = '';
    let homeLabel = '';
    let awayLabel = '';

    if (leftSideRole === 'home') {
      if (!leftTeam) {
        errors.push(
          `Fila ${row.excelRow}: no se encontró el equipo local "${teamRef}" en la competición`,
        );
        return;
      }
      homeTeamId = leftTeam.id;
      homeLabel = leftTeam.name;
      if (rivalTeam) {
        awayTeamId = rivalTeam.id;
        awayLabel = rivalTeam.name;
      } else if (row.rival) {
        awayTeamName = row.rival;
        awayLabel = row.rival;
      } else {
        errors.push(`Fila ${row.excelRow}: falta el rival`);
        return;
      }
    } else {
      // izquierda = visitante → el rival debe ser el local registrado
      if (!rivalTeam) {
        errors.push(
          `Fila ${row.excelRow}: el local (columna rival) "${row.rival}" no está en la competición`,
        );
        return;
      }
      homeTeamId = rivalTeam.id;
      homeLabel = rivalTeam.name;
      if (leftTeam) {
        awayTeamId = leftTeam.id;
        awayLabel = leftTeam.name;
      } else if (teamRef) {
        awayTeamName = row.teamName || row.teamId;
        awayLabel = awayTeamName;
      } else {
        errors.push(`Fila ${row.excelRow}: falta el equipo visitante`);
        return;
      }
    }

    const time = row.matchTime || '19:00';
    const dt = new Date(`${row.matchDate}T${time}:00`);
    if (Number.isNaN(dt.getTime())) {
      errors.push(`Fila ${row.excelRow}: fecha/hora inválida`);
      return;
    }

    mapped.push({
      excelRow: row.excelRow,
      homeTeamId,
      awayTeamId: awayTeamId || undefined,
      awayTeamName: awayTeamName || undefined,
      homeLabel,
      awayLabel,
      teamNameHint: row.teamName || row.teamId,
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

/** Genera y descarga una plantilla Excel de ejemplo. */
export function downloadLeagueMatchesTemplate() {
  const sample = [
    {
      id: 'pegar-uuid-del-equipo',
      nombre_equipo: 'Titanes',
      rival: 'Cafeteros',
      fecha: '2026-09-01',
      hora: '19:00',
      ubicacion: 'Coliseo El Pueblo',
    },
    {
      id: '',
      nombre_equipo: 'Cafeteros',
      rival: 'Titanes',
      fecha: '2026-09-03',
      hora: '20:30',
      ubicacion: 'Arena Manizales',
    },
  ];
  const sheet = XLSX.utils.json_to_sheet(sample);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Partidos');
  XLSX.writeFile(book, 'plantilla-carga-partidos.xlsx');
}
