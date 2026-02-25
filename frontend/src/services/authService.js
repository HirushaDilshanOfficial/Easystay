import axios from 'axios';

const API_URL = 'http://localhost:5001/api/auth';

const login = async (email, password) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

/**
 * Signup - sends JSON for Student, FormData for BoardingOwner
 */
const signup = async (formData, role) => {
    let response;

    if (role === 'BoardingOwner') {
        // Must send as multipart/form-data for file uploads
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                value.forEach((file) => data.append(key, file));
            } else if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });
        response = await axios.post(`${API_URL}/signup`, data, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    } else {
        response = await axios.post(`${API_URL}/signup`, formData);
    }

    if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
};

const logout = () => {
    localStorage.removeItem('user');
};

const getCurrentUser = () => {
    return JSON.parse(localStorage.getItem('user'));
};

const authService = { login, signup, logout, getCurrentUser };

export default authService;
