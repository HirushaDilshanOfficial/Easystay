import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api", // Backend URL
    // You can add headers or interceptors here if needed later
});

export default api;
