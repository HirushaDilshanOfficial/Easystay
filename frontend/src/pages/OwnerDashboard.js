import React, { useState, useEffect } from 'react';
import api from '../api';
import { User, Phone, Mail, Calendar, Clock, Home, MapPin } from 'lucide-react';

const OwnerDashboard = ({ embeddedOwnerId }) => {
    const [ownerId, setOwnerId] = useState(embeddedOwnerId || localStorage.getItem('ownerId') || '');
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!(embeddedOwnerId || localStorage.getItem('ownerId')));

    useEffect(() => {
        if (embeddedOwnerId) {
            setOwnerId(embeddedOwnerId);
            setIsLoggedIn(true);
        }
    }, [embeddedOwnerId]);

    useEffect(() => {
        if (isLoggedIn && ownerId) {
            fetchAppointments();
        }
    }, [isLoggedIn, ownerId]);

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

    // Only show login form if not embedded and not logged in
    if (!isLoggedIn && !embeddedOwnerId) {
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
        <div style={{ padding: embeddedOwnerId ? '24px' : undefined }} className={embeddedOwnerId ? '' : 'owner-dashboard'}>
            {!embeddedOwnerId && (
                <div className="dashboard-header">
                    <div>
                        <h1>Owner Dashboard</h1>
                        <p>ID: <strong>{ownerId}</strong></p>
                    </div>
                    <button onClick={handleLogout} className="btn-secondary">Logout</button>
                </div>
            )}

            {embeddedOwnerId && (
                <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>My Appointments</h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>View all student appointment requests for your properties.</p>
                </div>
            )}

            <div className={embeddedOwnerId ? '' : 'appointments-section'}>
                {!embeddedOwnerId && <h2>Recent Appointments</h2>}
                {loading ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#6b7280' }}>
                        <span>Loading appointments...</span>
                    </div>
                ) : appointments.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 0', color: '#9ca3af', gap: 12 }}>
                        <Calendar size={48} strokeWidth={1.5} />
                        <p style={{ fontWeight: 500 }}>No appointments scheduled yet.</p>
                        <p style={{ fontSize: '0.8rem' }}>When students book a viewing, they'll appear here.</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
                        {appointments.map((app) => (
                            <div key={app._id} style={{
                                background: '#fff',
                                border: '1px solid #e5e7eb',
                                borderRadius: 16,
                                padding: 20,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                                transition: 'box-shadow 0.2s',
                            }}>
                                {/* Property Info */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f3f4f6' }}>
                                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <Home size={18} color="#3b82f6" />
                                    </div>
                                    <div>
                                        <p style={{ fontWeight: 700, color: '#1f2937', fontSize: '0.9rem', margin: 0 }}>{app.boardingId?.title || 'Property'}</p>
                                        <p style={{ color: '#9ca3af', fontSize: '0.75rem', margin: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <MapPin size={11} /> {app.boardingId?.address || '—'}
                                        </p>
                                    </div>
                                </div>
                                {/* Student Info */}
                                <div style={{ marginBottom: 12 }}>
                                    <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Student Details</p>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: '0.85rem' }}>
                                            <User size={14} color="#6b7280" /> <span>{app.userName}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: '0.85rem' }}>
                                            <Mail size={14} color="#6b7280" /> <span>{app.userEmail}</span>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#374151', fontSize: '0.85rem' }}>
                                            <Phone size={14} color="#6b7280" /> <span>{app.userPhone}</span>
                                        </div>
                                    </div>
                                </div>
                                {/* Date & Time */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#eff6ff', color: '#2563eb', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                                        <Calendar size={13} /> {app.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', color: '#16a34a', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                                        <Clock size={13} /> {app.timeSlot}
                                    </span>
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

