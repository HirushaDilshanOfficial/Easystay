import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Phone, Mail, Calendar, Clock, Home, MapPin } from 'lucide-react';

const OwnerDashboard = () => {
    const [ownerName, setOwnerName] = useState(localStorage.getItem('ownerName') || '');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('ownerName'));

    useEffect(() => {
        if (isLoggedIn && ownerName) {
            fetchAppointments();
        }
    }, [isLoggedIn]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/boardings/owner/appointments/${ownerName}`);
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (ownerName.trim()) {
            localStorage.setItem('ownerName', ownerName);
            setIsLoggedIn(true);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ownerName');
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
                            placeholder="Your Registered Owner Name" 
                            value={ownerName} 
                            onChange={(e) => setOwnerName(e.target.value)}
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
                    <h1>Welcome, {ownerName}</h1>
                    <p>Manage your student viewing appointments</p>
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
