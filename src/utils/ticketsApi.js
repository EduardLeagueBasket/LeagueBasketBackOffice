export const TICKETS_VENUES_PATH = '/tickets/venues';
export const TICKETS_SECTIONS_PATH = '/tickets/sections';
export const TICKETS_EVENTS_PATH = '/tickets/events';
export const TICKETS_PROMOTIONS_PATH = '/tickets/promotions';
export const TICKETS_PATH = '/tickets';
export const TICKETS_ORDERS_PATH = '/tickets/orders';
export const TICKETS_RAFFLES_PATH = '/tickets/raffles';
export const TICKETS_POINTS_PATH = '/tickets/points';

export const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const SECTION_TYPES = [
  { value: 'BLEACHERS', label: 'Gradas' },
  { value: 'LATERAL', label: 'Lateral' },
  { value: 'NUMBERED', label: 'Sillas numeradas' },
  { value: 'VIP', label: 'VIP' },
  { value: 'BOX', label: 'Palco' },
  { value: 'FLOOR', label: 'Cancha' },
  { value: 'OTHER', label: 'Otro' },
];

export const PROMOTION_TYPES = [
  { value: 'PERCENTAGE', label: 'Descuento %' },
  { value: 'TWO_FOR_ONE', label: '2x1' },
  { value: 'FIXED', label: 'Monto fijo' },
  { value: 'POINTS_BONUS', label: 'Puntos extra' },
];

export const PRIZE_TYPES = [
  { value: 'TICKET', label: 'Boleto' },
  { value: 'JERSEY', label: 'Camiseta' },
  { value: 'BALL', label: 'Balón' },
  { value: 'VOUCHER', label: 'Cupón' },
  { value: 'OTHER', label: 'Otro' },
];

export const formatSectionType = (value) =>
  SECTION_TYPES.find((t) => t.value === value)?.label ?? value ?? '—';

export const formatTicketStatus = (value) => {
  const map = {
    AVAILABLE: 'Disponible',
    SOLD: 'Vendido',
    TRANSFERRED: 'Transferido',
    GIFTED: 'Regalado',
    REDEEMED: 'Canjeado',
    USED: 'Usado',
    CANCELLED: 'Cancelado',
  };
  return map[value] ?? value ?? '—';
};

export const formatTicketOrigin = (value) => {
  const map = { APP: 'App', TAQUILLA: 'Taquilla' };
  return map[value] ?? value ?? '—';
};

export const formatOrderStatus = (value) => {
  const map = {
    PENDING: 'Pendiente',
    PAID: 'Pagado',
    CANCELLED: 'Cancelado',
    REFUNDED: 'Reembolsado',
  };
  return map[value] ?? value ?? '—';
};

export const formatPromotionType = (value) =>
  PROMOTION_TYPES.find((t) => t.value === value)?.label ?? value ?? '—';

export const formatRaffleStatus = (value) => {
  const map = {
    PENDING: 'Pendiente',
    ACTIVE: 'Activo',
    DRAWN: 'Sorteado',
    CANCELLED: 'Cancelado',
  };
  return map[value] ?? value ?? '—';
};

export const formatDateTime = (value) =>
  value ? new Date(value).toLocaleString('es') : '—';

export const toDatetimeLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
