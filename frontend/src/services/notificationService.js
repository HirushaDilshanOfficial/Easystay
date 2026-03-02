import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:5001/api/notifications';

const getNotifications = async () => {
    const user = authService.getCurrentUser();
    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    };
    const response = await axios.get(API_URL, config);
    return response.data;
};

const markAllAsRead = async () => {
    const user = authService.getCurrentUser();
    const config = {
        headers: {
            Authorization: `Bearer ${user?.token}`
        }
    };
    const response = await axios.put(`${API_URL}/mark-read`, {}, config);
    return response.data;
};

const notificationService = {
    getNotifications,
    markAllAsRead
};

export default notificationService;
