import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5100/api',
    withCredentials: true, 
});

// Request interceptor to add access token to headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle 401 and refresh token
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If error is 401 then retry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Call refresh token endpoint
                const { data } = await api.post('/auth/refresh');

                // Update access token
                localStorage.setItem('token', data.accessToken);

                // Update header for original request
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                // Retry original request
                return api(originalRequest);
            } catch (refreshError) {
                // If refresh fails, redirect to login
                localStorage.removeItem('token');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
