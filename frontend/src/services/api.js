import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
export const csrfCookieUrl = baseURL.replace(/\/api\/?$/, '/sanctum/csrf-cookie');
const api = axios.create({ baseURL, withCredentials: true, withXSRFToken: true, headers: { Accept: 'application/json' } });
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401) {
    localStorage.removeItem('genz-user');
    if (window.location.pathname !== '/login') window.location.href = '/login';
  }
  return Promise.reject(error);
});
export default api;
