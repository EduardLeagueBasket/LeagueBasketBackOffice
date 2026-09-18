/** API de temporadas (`/api/admin/engine/seasons`). */

export const SEASONS_API = '/admin/engine/seasons';

export const SEASON_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
};

export const SEASON_STATUS_LABEL = {
  PENDING: 'Pendiente',
  ACTIVE: 'Activa',
  COMPLETED: 'Finalizada',
};

export function normalizeSeasonsList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export function normalizeSeasonTeams(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export function seasonStatusOf(season) {
  if (season?.status) return season.status;
  return season?.isActive ? SEASON_STATUS.ACTIVE : SEASON_STATUS.COMPLETED;
}

export function buildCreateSeasonBody({
  name,
  competitionId,
  startDate,
  endDate,
  status,
}) {
  const body = {
    name,
    competitionId,
    status: status || SEASON_STATUS.PENDING,
  };
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  return body;
}
