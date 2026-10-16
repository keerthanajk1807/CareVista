import axios from "axios";
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  timeout: 10000
});
api.interceptors.request.use(config => {
  const token = localStorage.getItem("medislotToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  if (import.meta.env.DEV) console.info(`[API request] ${config.method.toUpperCase()} ${config.url}`);
  return config;
});
api.interceptors.response.use(response => {
  if (import.meta.env.DEV) console.info(`[API response] ${response.status} ${response.config.url}`, response.config.url.includes('/auth/') ? {
    message: 'Authentication response received'
  } : response.data);
  return response;
}, error => {
  if (import.meta.env.DEV) console.error('[API error]', error.response?.status || 'Network', error.response?.data?.message || error.message);
  if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) window.dispatchEvent(new Event('session-expired'));
  return Promise.reject(error);
});
export default api;
