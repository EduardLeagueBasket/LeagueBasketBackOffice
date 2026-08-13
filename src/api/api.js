// src/api/api.js
import axios from 'axios';

// Base de tu backend (puedes usar variables de entorno para mayor flexibilidad)
const BASE_URL = process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : 'http://localhost:8000/api';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    // Puedes agregar otros headers como tokens si es necesario
  },
});

axiosInstance.interceptors.request.use((config) => {
  const user = localStorage.getItem('user');
  if (user) {
    const parsedUser = JSON.parse(user);
    const token = parsedUser?.token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  // FormData necesita que el runtime ponga el boundary; no forzar Content-Type.
  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    const headers = config.headers;
    if (headers && typeof headers.set === 'function') {
      // false = eliminar header en AxiosHeaders
      headers.set('Content-Type', false);
    } else if (headers) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

/** Rutas del panel admin en el gateway: `/api/admin/...` (JWT + rol backoffice). */
export const adminPath = (path) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `/admin${p}`;
};

// Funciones generales

export const apiGet = async (url, params = {}, headers = {}) => {
  const response = await axiosInstance.get(url, {
    params,
    headers
  });
  return response.data;
};

export const apiPost = async (url, data, config = {}) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

export const apiPostFormData = async (url, formData, config = {}) => {
  const response = await axiosInstance.post(url, formData, config);
  return response.data;
};

export const apiPut = async (url, data, headers = {}) => {
  const response = await axiosInstance.put(url, data, { headers });
  return response.data;
};

export const apiPatch = async (url, data, headers = {}) => {
  const response = await axiosInstance.patch(url, data, { headers });
  return response.data;
};

export const apiPatchFormData = async (url, formData, config = {}) => {
  const response = await axiosInstance.patch(url, formData, config);
  return response.data;
};

export const apiDelete = async (url, headers = {}) => {
  const response = await axiosInstance.delete(url, { headers });
  return response.data;
};