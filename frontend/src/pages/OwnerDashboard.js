import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';
import { User, Phone, Mail, Calendar, Clock, Home, MapPin, CheckCircle, XCircle, Trash2, Bell, Check, AlertCircle } from 'lucide-react';

const OwnerDashboard = ({ embeddedOwnerId }) => {
    const [ownerId, setOwnerId] = useState(embeddedOwnerId || localStorage.getItem('ownerId') || '');
    const [appointments, setAppointments] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(!!(embeddedOwnerId || localStorage.getItem('ownerId')));

    // Rejection Modal State
    const [showRejectionModal, setShowRejectionModal] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [activeAppId, setActiveAppId] = useState(null);
    const [isSubmittingRejection, setIsSubmittingRejection] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!ownerId) return;
        try {
            const res = await api.get(`/notifications/owner/${ownerId}`);
            setNotifications(res.data.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    }, [ownerId]);

    const fetchAppointments = useCallback(async () => {
        if (!ownerId) return;
        setLoading(true);
        try {
            const res = await api.get(`/boardings/owner/appointments/${ownerId}`);
            setAppointments(res.data.data);
        } catch (err) {
            console.error('Failed to fetch appointments:', err);
        } finally {
            setLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        if (embeddedOwnerId) {
            setOwnerId(embeddedOwnerId);
            setIsLoggedIn(true);
        }
    }, [embeddedOwnerId]);

    useEffect(() => {
        if (isLoggedIn && ownerId) {
            fetchAppointments();
            fetchNotifications();

            // Set up polling for real-time feel (every 30 seconds)
            const interval = setInterval(() => {
                fetchAppointments();
                fetchNotifications();
            }, 30000);

            return () => clearInterval(interval);
        }
    }, [isLoggedIn, ownerId, fetchAppointments, fetchNotifications]);

    const handleLogin = (e) => {
        e.preventDefault();
        if (ownerId.trim()) {
            localStorage.setItem('ownerId', ownerId);
            setIsLoggedIn(true);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        if (status === 'Rejected') {
            setActiveAppId(id);
            setRejectionReason('');
            setShowRejectionModal(true);
            return;
        }

        try {
            await api.put(`/appointments/status/${id}`, { status });
            fetchAppointments();
        } catch (err) {
            console.error('Failed to update status:', err);
            alert('Failed to update status');
        }
    };

    const submitRejection = async () => {
        if (!rejectionReason.trim()) {
            alert('Please enter a reason for rejection');
            return;
        }

        setIsSubmittingRejection(true);
        try {
            await api.put(`/appointments/status/${activeAppId}`, { 
                status: 'Rejected', 
                rejectionReason 
            });
            setShowRejectionModal(false);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to reject appointment:', err);
            alert('Failed to reject appointment');
        } finally {
            setIsSubmittingRejection(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) return;
        try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments();
        } catch (err) {
            console.error('Failed to delete appointment:', err);
            alert('Failed to delete appointment');
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to mark as read:', err);
        }
    };

    const handleDeleteNotification = async (id) => {
        try {
            await api.delete(`/notifications/${id}`);
            fetchNotifications();
        } catch (err) {
            console.error('Failed to delete notification:', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ownerId');
        setIsLoggedIn(false);
        setAppointments([]);
        setNotifications([]);
    };

    const unreadCount = notifications.filter(n => !n.isRead).length;

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
                <div className="dashboard-header" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#111827', margin: 0 }}>Owner Dashboard</h1>
                        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>ID: <strong>{ownerId}</strong></p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                        {/* Notifications */}
                        <div style={{ position: 'relative' }}>
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                style={{ 
                                    width: 44, 
                                    height: 44, 
                                    borderRadius: 12, 
                                    background: '#fff', 
                                    border: '1px solid #e5e7eb', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <Bell size={20} color="#4b5563" />
                                {unreadCount > 0 && (
                                    <span style={{ 
                                        position: 'absolute', 
                                        top: -4, 
                                        right: -4, 
                                        background: '#ef4444', 
                                        color: '#fff', 
                                        fontSize: '10px', 
                                        fontWeight: 800, 
                                        width: 18, 
                                        height: 18, 
                                        borderRadius: '50%', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        border: '2px solid #fff'
                                    }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: 52, 
                                    right: 0, 
                                    width: 320, 
                                    background: '#fff', 
                                    borderRadius: 16, 
                                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                                    border: '1px solid #e5e7eb', 
                                    zIndex: 100,
                                    overflow: 'hidden'
                                }}>
                                    <div style={{ padding: '16px 20px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>Notifications</h3>
                                    </div>
                                    <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                                        {notifications.length === 0 ? (
                                            <div style={{ padding: 40, textAlign: 'center' }}>
                                                <Bell size={24} color="#d1d5db" style={{ marginBottom: 8 }} />
                                                <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>No notifications yet</p>
                                            </div>
                                        ) : (
                                            notifications.map(note => (
                                                <div 
                                                    key={note._id} 
                                                    style={{ 
                                                        padding: '12px 20px', 
                                                        borderBottom: '1px solid #f9fafb', 
                                                        background: note.isRead ? '#fff' : '#f0f7ff',
                                                        position: 'relative',
                                                        display: 'flex',
                                                        gap: 12
                                                    }}
                                                >
                                                    <div style={{ 
                                                        width: 10, 
                                                        height: 10, 
                                                        borderRadius: '50%', 
                                                        background: note.type === 'success' ? '#10b981' : note.type === 'error' ? '#ef4444' : '#3b82f6',
                                                        marginTop: 4,
                                                        flexShrink: 0,
                                                        display: note.isRead ? 'none' : 'block'
                                                    }} />
                                                    <div style={{ flex: 1 }}>
                                                        <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 700, color: '#1f2937' }}>{note.title}</p>
                                                        <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: '#4b5563', lineHeight: 1.4 }}>{note.description}</p>
                                                        <p style={{ margin: '6px 0 0', fontSize: '0.7rem', color: '#9ca3af' }}>{new Date(note.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                        {!note.isRead && (
                                                            <button 
                                                                onClick={() => handleMarkAsRead(note._id)}
                                                                style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 2 }}
                                                                title="Mark as read"
                                                            >
                                                                <Check size={14} />
                                                            </button>
                                                        )}
                                                        <button 
                                                            onClick={() => handleDeleteNotification(note._id)}
                                                            style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 2 }}
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <button onClick={handleLogout} className="btn-secondary">Logout</button>
                    </div>
                </div>
            )}

            {embeddedOwnerId && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1f2937', marginBottom: 4 }}>My Appointments</h2>
                        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>View all student appointment requests for your properties.</p>
                    </div>
                    
                    {/* Embedded Notifications Bell */}
                    <div style={{ position: 'relative' }}>
                        <button 
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ 
                                width: 40, 
                                height: 40, 
                                borderRadius: 10, 
                                background: '#f9fafb', 
                                border: '1px solid #e5e7eb', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                        >
                            <Bell size={18} color="#4b5563" />
                            {unreadCount > 0 && (
                                <span style={{ 
                                    position: 'absolute', 
                                    top: -2, 
                                    right: -2, 
                                    background: '#ef4444', 
                                    color: '#fff', 
                                    fontSize: '9px', 
                                    fontWeight: 800, 
                                    width: 16, 
                                    height: 16, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    border: '1.5px solid #fff'
                                }}>
                                    {unreadCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div style={{ 
                                position: 'absolute', 
                                top: 48, 
                                right: 0, 
                                width: 280, 
                                background: '#fff', 
                                borderRadius: 12, 
                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
                                border: '1px solid #e5e7eb', 
                                zIndex: 100,
                                overflow: 'hidden'
                            }}>
                                <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: 20, textAlign: 'center' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#9ca3af' }}>No new alerts</p>
                                        </div>
                                    ) : (
                                        notifications.map(note => (
                                            <div key={note._id} style={{ padding: '10px 15px', borderBottom: '1px solid #f9fafb', background: note.isRead ? '#fff' : '#f0f7ff', display: 'flex', gap: 8 }}>
                                                <div style={{ flex: 1 }}>
                                                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 700 }}>{note.title}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#6b7280' }}>{note.description}</p>
                                                </div>
                                                <button onClick={() => handleMarkAsRead(note._id)} style={{ padding: 4, background: 'none', border: 'none', color: '#10b981', cursor: 'pointer' }}><Check size={12} /></button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
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
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12, paddingBottom: 16, borderBottom: '1px solid #f3f4f6' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#eff6ff', color: '#2563eb', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                                        <Calendar size={13} /> {app.date}
                                    </span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#f0fdf4', color: '#16a34a', borderRadius: 8, padding: '4px 10px', fontSize: '0.78rem', fontWeight: 600 }}>
                                        <Clock size={13} /> {app.timeSlot}
                                    </span>
                                    <span style={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 5, 
                                        background: app.status === 'Approved' ? '#ecfdf5' : app.status === 'Rejected' ? '#fef2f2' : '#fffbeb', 
                                        color: app.status === 'Approved' ? '#059669' : app.status === 'Rejected' ? '#dc2626' : '#d97706', 
                                        borderRadius: 8, 
                                        padding: '4px 10px', 
                                        fontSize: '0.78rem', 
                                        fontWeight: 700,
                                        marginLeft: 'auto'
                                    }}>
                                        {app.status || 'Pending'}
                                    </span>
                                </div>

                                {app.status === 'Rejected' && app.rejectionReason && (
                                    <div style={{ marginTop: 12, padding: '10px 12px', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: 10 }}>
                                        <p style={{ margin: 0, fontSize: '0.75rem', fontWeight: 600, color: '#991b1b', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 }}>Rejection Reason</p>
                                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#dc2626', fontStyle: 'italic' }}>"{app.rejectionReason}"</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                                    {app.status === 'Pending' && (
                                        <>
                                            <button 
                                                onClick={() => handleUpdateStatus(app._id, 'Approved')}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#059669', color: '#fff', border: 'none', borderRadius: 10, padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <CheckCircle size={14} /> Approve
                                            </button>
                                            <button 
                                                onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                                                style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, background: '#fff', color: '#dc2626', border: '1px solid #fee2e2', borderRadius: 10, padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                            >
                                                <XCircle size={14} /> Reject
                                            </button>
                                        </>
                                    )}
                                    {app.status !== 'Pending' && (
                                        <button 
                                            onClick={() => handleUpdateStatus(app._id, 'Pending')}
                                            style={{ flex: 1, background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 10, padding: '8px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                                        >
                                            Reset to Pending
                                        </button>
                                    )}
                                    <button 
                                        onClick={() => handleDelete(app._id)}
                                        style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fef2f2', color: '#ef4444', border: 'none', borderRadius: 10, cursor: 'pointer' }}
                                        title="Delete Appointment"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Rejection Modal */}
            {showRejectionModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0, 0, 0, 0.4)',
                    backdropFilter: 'blur(4px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 2000,
                    padding: 20
                }}>
                    <div style={{
                        background: '#fff',
                        width: '100%',
                        maxWidth: 440,
                        borderRadius: 24,
                        padding: 32,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                        animation: 'fadeInUp 0.3s ease-out'
                    }}>
                        <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
                            <div style={{ width: 48, height: 48, borderRadius: 14, background: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <AlertCircle size={24} color="#ef4444" />
                            </div>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>Reject Appointment</h3>
                                <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: 4 }}>Please let the student know why you're declining their request.</p>
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>Reason for Rejection</label>
                            <textarea 
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="E.g., Property already booked, Owner traveling, etc..."
                                style={{
                                    width: '100%',
                                    height: 120,
                                    borderRadius: 16,
                                    border: '1px solid #e5e7eb',
                                    padding: '12px 16px',
                                    fontSize: '0.9rem',
                                    outline: 'none',
                                    resize: 'none',
                                    transition: 'border-color 0.2s',
                                    fontFamily: 'inherit'
                                }}
                                autoFocus
                            />
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button 
                                onClick={() => setShowRejectionModal(false)}
                                disabled={isSubmittingRejection}
                                style={{ flex: 1, padding: '12px', background: '#f3f4f6', color: '#4b5563', border: 'none', borderRadius: 14, fontWeight: 700, fontSize: '0.9rem', cursor: 'pointer' }}
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitRejection}
                                disabled={isSubmittingRejection || !rejectionReason.trim()}
                                style={{ 
                                    flex: 1.5, 
                                    padding: '12px', 
                                    background: '#ef4444', 
                                    color: '#fff', 
                                    border: 'none', 
                                    borderRadius: 14, 
                                    fontWeight: 700, 
                                    fontSize: '0.9rem', 
                                    cursor: 'pointer',
                                    opacity: (isSubmittingRejection || !rejectionReason.trim()) ? 0.6 : 1
                                }}
                            >
                                {isSubmittingRejection ? 'Rejecting...' : 'Confirm Rejection'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default OwnerDashboard;

