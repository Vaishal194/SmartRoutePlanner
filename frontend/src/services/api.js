import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const getGraph = () => api.get('/graph');
export const getTraffic = () => api.get('/traffic');
export const findRoute = (algo, data) => api.post(`/route/${algo}`, data);
export const findRouteRace = (data) => api.post(`/route/race`, data);
export const searchCity = (name) => api.get(`/search/city/${name}`);
export const getHistory = (key) => api.get(`/history/${key}`);

export default api;
