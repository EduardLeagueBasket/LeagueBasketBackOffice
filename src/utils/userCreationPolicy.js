const ADMIN_PROFILES = new Set(['ADMIN', 'SUPER_ADMIN']);

const ALLOWED_PROFILE_BY_MANAGER = {
  MANAGER_LEAGUE: 'ASISTANT_LEAGUE',
  MANAGER_TEAM: 'ASISTANT_TEAM',
  MANAGER_NATIONAL_TEAM: 'ASISTANT_NATIONAL_TEAM',
  MANAGER_REGIONAL_TEAM: 'ASISTANT_REGIONAL_TEAM',
};

export function filterCreatableProfiles(actorProfile, profiles) {
  if (ADMIN_PROFILES.has(actorProfile)) {
    return profiles.filter((profile) => profile.name !== 'USER');
  }

  const allowedProfile = ALLOWED_PROFILE_BY_MANAGER[actorProfile];
  return allowedProfile
    ? profiles.filter((profile) => profile.name === allowedProfile)
    : [];
}
