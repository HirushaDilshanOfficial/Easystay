import axios from "axios";

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL?.replace(/\/$/, '') || "http://localhost:5000/api", // Backend URL
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
    (config) => {
        const storedUser = JSON.parse(localStorage.getItem('user'));
        const token = storedUser?.token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
