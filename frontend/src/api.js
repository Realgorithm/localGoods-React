import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
    withCredentials: true,
});

// If the session has expired or the token is invalid, send the user back to
// login instead of leaving every page silently failing its API calls.
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;
        const requestUrl = error.config?.url || '';
        const isAuthCheck = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/me');

        if ((status === 401 || status === 403) && !isAuthCheck && window.location.pathname !== '/login') {
            window.location.href = '/login';
        }

        return Promise.reject(error);
    }
);

export default api;
