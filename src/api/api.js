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

  return config;
}, (error) => {
  return Promise.reject(error);
});
// Funciones generales

export const apiGet = async (url, params = {}, headers = {}) => {
  console.log('apiGet called with:', { url, params, headers });
  console.log('Full URL:', `${BASE_URL}${url}`);
  const response = await axiosInstance.get(url, {
    params,
    headers
  });
  console.log('apiGet response:', response.data);
  return response.data;
};

export const apiPost = async (url, data, config = {}) => {
  const response = await axiosInstance.post(url, data, config);
  return response.data;
};

export const apiPut = async (url, data, headers = {}) => {
  const response = await axiosInstance.put(url, data, { headers });
  return response.data;
};

export const apiDelete = async (url, headers = {}) => {
  const response = await axiosInstance.delete(url, { headers });
  return response.data;
};