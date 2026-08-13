/**
 * Convierte un error de axios / API en texto seguro para Redux y JSX.
 * Evita guardar { statusCode, message } como objeto en el estado.
 */
export function axiosErrorToMessage(error) {
  const data = error?.response?.data;
  if (typeof data === 'string') return data;
  if (data == null) return error?.message || 'Error desconocido';
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message)) return data.message.join('; ');
  if (typeof data.error === 'string') return data.error;
  try {
    return JSON.stringify(data);
  } catch {
    return 'Error desconocido';
  }
}

/** Para mostrar valores que ya pueden ser string u objeto (estado legado). */
export function formatErrorForDisplay(value) {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && typeof value.message === 'string') {
    return value.message;
  }
  if (typeof value === 'object' && Array.isArray(value.message)) {
    return value.message.join('; ');
  }
  try {
    return JSON.stringify(value);
  } catch {
    return 'Error desconocido';
  }
}
