/** Estados de partido nacionales (alineado con Prisma / gateway). */

export const nationalMatchStatuses = [
  { value: 'scheduled', label: 'Programado' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Finalizado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export const nationalMatchListFilters = [
  { value: 'upcoming', label: 'Próximos' },
  { value: 'live', label: 'En vivo' },
  { value: 'finished', label: 'Finalizados' },
  { value: 'cancelled', label: 'Cancelados' },
  { value: 'all', label: 'Todos' },
];

export function getNationalMatchStatusLabel(status) {
  const row = nationalMatchStatuses.find((s) => s.value === status);
  return row ? row.label : status || '—';
}

export function getNationalMatchStatusBadgeClass(status) {
  switch (status) {
    case 'scheduled':
      return 'bg-primary';
    case 'live':
      return 'bg-danger';
    case 'finished':
      return 'bg-secondary';
    case 'cancelled':
      return 'bg-dark';
    default:
      return 'bg-secondary';
  }
}
