import axios from 'axios';

const API_URL = 'http://localhost:5001/api/users';

const getAuthConfig = () => {
    const userData = JSON.parse(localStorage.getItem('user'));
    return {
        headers: {
            Authorization: `Bearer ${userData?.token}`,
        },
    };
};

const getUsers = async () => {
    const response = await axios.get(API_URL, getAuthConfig());
    return response.data;
};

const getStats = async () => {
    const response = await axios.get(`${API_URL}/stats`, getAuthConfig());
    return response.data;
};

const updateUserStatus = async (id, status, rejectionReason = null) => {
    const response = await axios.put(`${API_URL}/${id}/status`, { status, rejectionReason }, getAuthConfig());
    return response.data;
};

const updateUser = async (id, userData) => {
    const response = await axios.put(`${API_URL}/${id}`, userData, getAuthConfig());
    return response.data;
};

const deleteUser = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`, getAuthConfig());
    return response.data;
};

const userService = {
    getUsers,
    getStats,
    updateUserStatus,
    updateUser,
    deleteUser
};

export default userService;
