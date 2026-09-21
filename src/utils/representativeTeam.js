const REGIONAL_PROFILES = new Set([
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
]);

const REPRESENTATIVE_PROFILES = new Set([
  'MANAGER_NATIONAL_TEAM',
  'ASISTANT_NATIONAL_TEAM',
  'MANAGER_REGIONAL_TEAM',
  'ASISTANT_REGIONAL_TEAM',
]);

export function isRegionalStaff(user) {
  return REGIONAL_PROFILES.has(user?.profile?.name);
}

export function isRepresentativeStaff(user) {
  return REPRESENTATIVE_PROFILES.has(user?.profile?.name);
}

export function isRegionalTeam(team) {
  return team?.type === 'regional';
}

export function representativeTeamLabel(team) {
  if (!team?.name) return 'N/A';
  const kind = isRegionalTeam(team) ? 'Regional' : 'Nacional';
  const extra = team.region || team.countryCode || team.country || '';
  return extra ? `${team.name} (${kind} · ${extra})` : `${team.name} (${kind})`;
}

export function resolveMyTeam(myNationalTeam) {
  if (!myNationalTeam) return null;
  if (myNationalTeam.id) return myNationalTeam;
  if (myNationalTeam.data?.id) return myNationalTeam.data;
  if (myNationalTeam.team?.id) return myNationalTeam.team;
  return null;
}
