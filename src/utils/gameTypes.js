export const nationalGameTypes = [
  { value: 'FRIENDLY', label: 'Amistoso' },
  { value: 'QUALIFIER', label: 'Clasificatorio' },
  { value: 'TOURNAMENT', label: 'Torneo' },
];

export const getGameTypeLabel = (value) => {
  const gameType = nationalGameTypes.find(type => type.value === value);
  return gameType ? gameType.label : value;
};

export const getGameTypeBadgeClass = (value) => {
  switch (value) {
    case 'FRIENDLY':
      return 'bg-success';
    case 'QUALIFIER':
      return 'bg-warning';
    case 'TOURNAMENT':
      return 'bg-primary';
    default:
      return 'bg-secondary';
  }
}; 