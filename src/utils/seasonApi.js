/** API de temporadas (`/api/admin/engine/seasons`). */

export const SEASONS_API = '/admin/engine/seasons';

export function normalizeSeasonsList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}

export function buildCreateSeasonBody({
  name,
  competitionId,
  startDate,
  endDate,
  isActive,
}) {
  const body = { name, competitionId };
  if (startDate) body.startDate = startDate;
  if (endDate) body.endDate = endDate;
  if (typeof isActive === 'boolean') body.isActive = isActive;
  return body;
}
