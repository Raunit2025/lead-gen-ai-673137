import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('leadgen_accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('leadgen_refreshToken');
        const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });
        const { accessToken } = response.data;
        localStorage.setItem('leadgen_accessToken', accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem('leadgen_accessToken');
        localStorage.removeItem('leadgen_refreshToken');
        localStorage.removeItem('leadgen_auth');
        localStorage.removeItem('leadgen_user');
        window.location.href = '/auth';
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
