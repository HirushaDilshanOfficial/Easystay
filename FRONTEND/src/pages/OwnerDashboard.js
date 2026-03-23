import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Phone, Mail, Calendar, Clock, Home, MapPin } from 'lucide-react';

const OwnerDashboard = () => {
    const [ownerId, setOwnerId] = useState(localStorage.getItem('ownerId') || '');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('ownerId'));

    useEffect(() => {
        if (isLoggedIn && ownerId) {
            fetchAppointments();
        }
    }, [isLoggedIn]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/boardings/owner/appointments/${ownerId}`);
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (ownerId.trim()) {
            localStorage.setItem('ownerId', ownerId);
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ownerId');
        setIsLoggedIn(false);
        setAppointments([]);
    };

    if (!isLoggedIn) {
        return (
            <div className="owner-login-container">
                <div className="login-card">
                    <h2>Owner Dashboard</h2>
                    <p>Enter your name to view your property appointments</p>
                    <form onSubmit={handleLogin}>
                        <input 
                            type="text" 
                            placeholder="Enter your Unique Owner ID" 
                            value={ownerId} 
                            onChange={(e) => setOwnerId(e.target.value)}
                            required
                        />
                        <button type="submit" className="btn-primary full-width">View Appointments</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="owner-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1>Owner Dashboard</h1>
                    <p>ID: <strong>{ownerId}</strong></p>
                </div>
                <button onClick={handleLogout} className="btn-secondary">Logout</button>
            </div>

            <div className="appointments-section">
                <h2>Recent Appointments</h2>
                {loading ? (
                    <div className="loading">Loading appointments...</div>
                ) : appointments.length === 0 ? (
                    <div className="empty-state">
                        <Calendar size={48} />
                        <p>No appointments scheduled yet.</p>
                    </div>
                ) : (
                    <div className="appointments-grid">
                        {appointments.map((app) => (
                            <div key={app._id} className="appointment-detail-card">
                                <div className="boarding-info">
                                    <Home size={18} />
                                    <h3>{app.boardingId?.title}</h3>
                                    <p className="address"><MapPin size={14} /> {app.boardingId?.address}</p>
                                </div>
                                <div className="student-info">
                                    <h4>Student Details:</h4>
                                    <div className="info-row">
                                        <User size={16} /> <span>{app.userName}</span>
                                    </div>
                                    <div className="info-row">
                                        <Mail size={16} /> <span>{app.userEmail}</span>
                                    </div>
                                    <div className="info-row">
                                        <Phone size={16} /> <span>{app.userPhone}</span>
                                    </div>
                                </div>
                                <div className="appointment-info">
                                    <div className="time-badge">
                                        <Calendar size={14} /> {app.date}
                                    </div>
                                    <div className="time-badge">
                                        <Clock size={14} /> {app.timeSlot}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default OwnerDashboard;
