import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5001/api", // Backend URL
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
