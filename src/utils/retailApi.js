export const RETAIL_PRODUCTS_PATH = '/retail/products';
export const RETAIL_ORDERS_PATH = '/retail/orders';
export const RETAIL_CATEGORIES_PATH = '/retail/categories';

export const normalizeList = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export const formatCategoria = (value) => {
  if (!value) return '—';
  return String(value).replace(/_/g, ' ');
};

export const formatTeamType = (value) => {
  if (value === 'NACIONAL') return 'Selección nacional';
  if (value === 'LIGA') return 'Equipo de liga';
  return value ?? '—';
};

export const formatEstadoPedido = (value) => {
  const map = {
    PENDIENTE: 'Pendiente',
    PAGADO: 'Pagado',
    ENVIADO: 'Enviado',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado',
  };
  return map[value] ?? value ?? '—';
};

export const productMainImage = (product) => {
  const imgs = product?.imagenes ?? [];
  const principal = imgs.find((i) => i.principal);
  return principal?.url ?? imgs[0]?.url ?? '';
};

export const productMinPrice = (product) => {
  const variantes = product?.variantes ?? [];
  if (!variantes.length) return null;
  return Math.min(...variantes.map((v) => Number(v.precio) || 0));
};

export const productTotalStock = (product) => {
  const variantes = product?.variantes ?? [];
  return variantes.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
};
