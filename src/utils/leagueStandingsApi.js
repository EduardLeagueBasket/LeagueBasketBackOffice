/** API de tabla de posiciones (`/api/admin/engine/standings`). */

export const LEAGUE_STANDINGS_API = '/admin/engine/standings';

export function normalizeStandingsList(response) {
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response)) return response;
  return [];
}
