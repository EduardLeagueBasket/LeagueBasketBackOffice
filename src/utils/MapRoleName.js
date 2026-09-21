export const mapProfileName = (name) => {
  switch (name) {
    case 'SUPER_ADMIN':
      return 'Super Admin';
    case 'ADMIN':
      return 'Admin';
    case 'MANAGER_LEAGUE':
      return 'Gerente de liga';
    case 'MANAGER_TEAM':
      return 'Gerente de equipo';
    case 'ASISTANT_LEAGUE':
      return 'Asistente';
    case 'ASISTANT_TEAM':
      return 'Asistente';
    case 'PLAYER':
      return 'Jugador';
    case 'MANAGER_NATIONAL_TEAM':
      return 'Gerente de equipo nacional';
    case 'ASISTANT_NATIONAL_TEAM':
      return 'Asistente de equipo nacional';
    case 'MANAGER_REGIONAL_TEAM':
      return 'Gerente de equipo regional';
    case 'ASISTANT_REGIONAL_TEAM':
      return 'Asistente de equipo regional';
    default:
      return name;
  }
};