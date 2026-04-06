import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://17pavankumarn.pythonanywhere.com/api/';

const api = axios.create({
    baseURL: API_BASE,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh');
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_BASE}users/refresh/`, {
                        refresh: refreshToken
                    });
                    localStorage.setItem('access', res.data.access);
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access}`;
                    return api(originalRequest);
                } catch (e) {
                    console.log("Token refresh failed", e);
                    localStorage.clear();
                    window.location.href = '/login';
                }
            } else {
                localStorage.clear();
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
