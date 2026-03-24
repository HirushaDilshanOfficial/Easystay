import React, { useState, useEffect } from 'react';
import {
    Typography, Button, Paper, Grid, Card, CardContent, Avatar, Box, Chip
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    Home as HomeIcon,
    Person as PersonIcon,
    Apartment as ApartmentIcon,
    Add as AddIcon,
    People as TenantsIcon,
    Star as StarIcon,
    NotificationsActive as BellIcon,
    AttachMoney as MoneyIcon,
    CalendarMonth as AppointmentsIcon,
    ReceiptLong as ReceiptIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import notificationService from '../services/notificationService';
import api from '../api';
import AddEditBoardingPage from './AddEditBoardingPage';
import OwnerDashboard from './OwnerDashboard';

const BoardingOwnerDashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const [boardings, setBoardings] = useState([]);
    const [tenancies, setTenancies] = useState([]);
    const [payments, setPayments] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'form'
    const [editingBoardingId, setEditingBoardingId] = useState(null);
    const [assigningStudent, setAssigningStudent] = useState(false);
    const [studentFormData, setStudentFormData] = useState({
        studentEmail: '',
        studentName: '',
        studentPhone: '',
        boardingId: ''
    });

    useEffect(() => {
        loadNotifications();
        if (user?.id) {
            loadBoardings();
            loadTenancies();
            loadPayments();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user?.id]);

    const loadNotifications = async () => {
        setLoading(true);
        try {
            const notes = await notificationService.getNotifications();
            setNotifications(notes.data);
        } catch (err) {
            console.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            loadNotifications();
        } catch (err) {
            console.error('Failed to mark notifications as read');
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'just now';
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d ago`;
        return date.toLocaleDateString();
    };

    const getNoteStyles = (type) => {
        switch (type) {
            case 'success': return { color: '#10b981', bg: '#ecfdf5' };
            case 'warning': return { color: '#f59e0b', bg: '#fffbeb' };
            case 'error': return { color: '#ef4444', bg: '#fef2f2' };
            default: return { color: '#3b82f6', bg: '#eff6ff' };
        }
    };

    const loadBoardings = async () => {
        try {
            const res = await api.get(`/boardings/owner/${user.id}`);
            setBoardings(res.data.data);
        } catch (err) {
            console.error('Failed to load boardings');
        }
    };

    const handleAddProperty = () => {
        setEditingBoardingId(null);
        setViewMode('form');
    };

    const handleEditProperty = (id) => {
        setEditingBoardingId(id);
        setViewMode('form');
    };

    const handleDeleteProperty = async (id) => {
        if (window.confirm('Are you sure you want to delete this property?')) {
            try {
                await api.delete(`/boardings/delete/${id}`);
                loadBoardings();
            } catch (err) {
                console.error('Failed to delete property');
            }
        }
    };

    const handleFormClose = () => {
        setViewMode('list');
        loadBoardings();
    };

    const loadTenancies = async () => {
        try {
            const res = await api.get(`/tenancy/owner/${user.id}`);
            setTenancies(res.data.data);
        } catch (err) {
            console.error('Failed to load tenancies');
        }
    };

    const handleAddTenancy = async (e) => {
        e.preventDefault();
        try {
            await api.post('/tenancy/add', {
                ...studentFormData,
                ownerId: user.id
            });
            setAssigningStudent(false);
            setStudentFormData({ studentEmail: '', studentName: '', studentPhone: '', boardingId: '' });
            loadTenancies();
        } catch (err) {
            console.error('Failed to assign student');
        }
    };

    const handleRemoveTenancy = async (id) => {
        if (window.confirm('Are you sure you want to remove this student?')) {
            try {
                await api.delete(`/tenancy/${id}`);
                loadTenancies();
            } catch (err) {
                console.error('Failed to remove tenancy');
            }
        }
    };

    const loadPayments = async () => {
        try {
            const res = await api.get('/payments/owner-payments');
            setPayments(res.data.data);
        } catch (err) {
            console.error('Failed to load payments');
        }
    };

    const handleUpdatePaymentStatus = async (paymentId, status) => {
        try {
            await api.put(`/payments/${paymentId}/status`, { status });
            loadPayments(); // Refresh list
        } catch (err) {
            console.error('Failed to update payment status');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
        { id: 'properties', label: 'My Properties', icon: <ApartmentIcon fontSize="small" /> },
        { id: 'appointments', label: 'Appointments', icon: <AppointmentsIcon fontSize="small" /> },
        { id: 'students', label: 'Students', icon: <TenantsIcon fontSize="small" /> },
        { id: 'payments', label: 'Payments', icon: <ReceiptIcon fontSize="small" /> },
        { id: 'profile', label: 'Profile', icon: <PersonIcon fontSize="small" /> },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <Typography variant="h6" className="font-bold text-blue-600 flex items-center gap-2">
                        <HomeIcon /> EasyStay
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#9ca3af', display: 'block', mt: 0.5 }}>Boarding Owner</Typography>
                </div>
                <div className="flex-1 px-4 space-y-1 mt-4">
                    {sidebarItems.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex items-center gap-3 p-3 rounded-xl font-medium cursor-pointer transition-all duration-200 ${activeTab === item.id ? 'bg-blue-50 text-blue-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                        >
                            {item.icon} {item.label}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-gray-100">
                    <Button
                        fullWidth
                        startIcon={<LogoutIcon />}
                        onClick={handleLogout}
                        color="error"
                        sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 2 }}
                    >
                        Logout
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-y-auto">
                <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
                    <Typography variant="h6" className="font-semibold text-gray-800">
                        Owner Dashboard
                    </Typography>
                    <div className="flex items-center gap-4">
                        <div className="px-3 py-1 rounded-full text-white text-xs font-bold bg-blue-500">
                            {user?.role}
                        </div>
                        <Avatar className="bg-blue-100 text-blue-600" src={user?.facePhoto}>
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                        </Avatar>
                    </div>
                </header>

                <main className="p-8">
                    {/* ── Dashboard Tab ── */}
                    {activeTab === 'dashboard' && (
                        <Grid container spacing={3}>
                            {/* Hero Banner */}
                            <Grid item xs={12}>
                                <Paper className="p-8 rounded-2xl shadow-sm overflow-hidden relative" sx={{ background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #60a5fa 100%)' }}>
                                    <Box className="relative z-10">
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem', mb: 1 }}>
                                            Welcome back, Owner
                                        </Typography>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
                                            {user?.name || user?.email?.split('@')[0]} 🏠
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500 }}>
                                            Manage your properties, track tenants, and grow your boarding business.
                                        </Typography>
                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={() => {
                                                setActiveTab('properties');
                                                handleAddProperty();
                                            }}
                                            sx={{ mt: 3, bgcolor: '#fff', color: '#1e40af', fontWeight: 700, borderRadius: 3, px: 4, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}
                                        >
                                            Add New Property
                                        </Button>
                                    </Box>
                                    <Box sx={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                    <Box sx={{ position: 'absolute', right: 60, bottom: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                </Paper>
                            </Grid>

                            {/* Stat Cards */}
                            {[
                                { label: 'Total Properties', value: boardings.length.toString(), sub: boardings.length > 0 ? `${boardings.length} Active Listings` : 'No properties yet', icon: <ApartmentIcon sx={{ color: '#3b82f6', fontSize: 22 }} />, bg: '#eff6ff', hover: 'rgba(59,130,246,0.12)' },
                                { label: 'Active Tenants', value: tenancies.length.toString(), sub: tenancies.length > 0 ? `${tenancies.length} Occupied Rooms` : 'No active tenants', icon: <TenantsIcon sx={{ color: '#10b981', fontSize: 22 }} />, bg: '#ecfdf5', hover: 'rgba(16,185,129,0.12)' },
                                { label: 'Monthly Revenue', value: `LKR ${payments.filter(p => p.status === 'Approved').reduce((acc, curr) => acc + curr.amount, 0).toLocaleString()}`, sub: 'Approved revenue', icon: <MoneyIcon sx={{ color: '#f59e0b', fontSize: 22 }} />, bg: '#fffbeb', hover: 'rgba(245,158,11,0.12)' },
                                { label: 'Pending Slips', value: payments.filter(p => p.status === 'Pending').length.toString(), sub: 'Review required', icon: <ReceiptIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />, bg: '#f5f3ff', hover: 'rgba(139,92,246,0.12)' },
                            ].map((stat, i) => (
                                <Grid item xs={12} sm={6} md={3} key={i}>
                                    <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 12px 24px ${stat.hover}` } }}>
                                        <CardContent sx={{ p: 3 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    {stat.icon}
                                                </Box>
                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>{stat.label}</Typography>
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 800, color: '#1f2937' }}>{stat.value}</Typography>
                                            <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>{stat.sub}</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            ))}

                            {/* Recent Activity & Notifications */}
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', overflow: 'hidden', background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%)', height: '100%' }}>
                                    <Box sx={{ p: 4 }}>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>🚀 Get Started</Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                            {boardings.length === 0 ? ['Add your first property listing', 'Upload high-quality photos', 'Set competitive pricing to attract tenants'].map((tip, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
                                                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>{tip}</Typography>
                                                </Box>
                                            )) : ['Keep your availability updated', 'Respond to appointments promptly', 'Ask students for reviews'].map((tip, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
                                                    <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>{tip}</Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper className="rounded-2xl shadow-sm overflow-hidden" sx={{ bgcolor: '#fff', border: '1px solid #f3f4f6', height: '100%' }}>
                                    <Box className="p-4 border-b border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <BellIcon className="text-blue-600" fontSize="small" />
                                            <Typography variant="subtitle2" className="font-bold text-gray-800">Recent Notifications</Typography>
                                        </div>
                                        {notifications.some(n => !n.isRead) && (
                                            <Typography
                                                variant="caption"
                                                sx={{ color: '#3b82f6', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                onClick={handleMarkAllRead}
                                            >
                                                Mark all as read
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box className="p-2 space-y-1" sx={{ maxHeight: 310, overflowY: 'auto' }}>
                                        {notifications.length > 0 ? (
                                            notifications.map((note) => {
                                                const styles = getNoteStyles(note.type);
                                                return (
                                                    <Box
                                                        key={note._id}
                                                        className="p-3 rounded-xl transition-all hover:bg-gray-50 cursor-pointer flex gap-3 relative"
                                                        sx={{ bgcolor: note.isRead ? 'transparent' : 'rgba(59, 130, 246, 0.03)' }}
                                                    >
                                                        {!note.isRead && (
                                                            <Box sx={{ position: 'absolute', right: 12, top: 12, width: 6, height: 6, borderRadius: '50%', bgcolor: '#3b82f6' }} />
                                                        )}
                                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0`} style={{ backgroundColor: styles.bg, color: styles.color }}>
                                                            <BellIcon sx={{ fontSize: 18 }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-0.5">
                                                                 <Typography variant="body2" className="font-bold text-gray-800 truncate">{note.title}</Typography>
                                                                 <Typography variant="caption" className="text-gray-400">{formatTime(note.createdAt)}</Typography>
                                                            </div>
                                                            <Typography variant="caption" className="text-gray-500 line-clamp-2 leading-tight">
                                                                {note.description}
                                                            </Typography>
                                                        </div>
                                                    </Box>
                                                );
                                            })
                                        ) : (
                                            <div className="py-8 text-center text-gray-400">
                                                <Typography variant="caption">No notifications yet</Typography>
                                            </div>
                                        )}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    )}

                    {/* ── My Properties Tab ── */}
                    {activeTab === 'properties' && (
                        <Box className="min-h-[500px]">
                            {viewMode === 'list' ? (
                                <Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                        <div>
                                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937' }}>My Properties</Typography>
                                            <Typography variant="body2" sx={{ color: '#9ca3af' }}>You have {boardings.length} properties listed</Typography>
                                        </div>
                                        <Button 
                                            variant="contained" 
                                            startIcon={<AddIcon />} 
                                            onClick={handleAddProperty}
                                            sx={{ borderRadius: 3, textTransform: 'none', px: 3, fontWeight: 700 }}
                                        >
                                            Add New Place
                                        </Button>
                                    </Box>

                                    {boardings.length === 0 ? (
                                        <Paper sx={{ p: 8, textAlign: 'center', borderRadius: 4, border: '1px dashed #e5e7eb', bgcolor: 'transparent' }}>
                                            <ApartmentIcon sx={{ fontSize: 48, color: '#d1d5db', mb: 2 }} />
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#374151' }}>No properties found</Typography>
                                            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>Start by adding your first boarding house listing.</Typography>
                                            <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddProperty} sx={{ borderRadius: 2, fontWeight: 700 }}>Add Your First Property</Button>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={3}>
                                            {boardings.map((p) => (
                                                <Grid item xs={12} sm={6} md={4} key={p._id}>
                                                    <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid #f3f4f6', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(0,0,0,0.08)' } }}>
                                                        <Box sx={{ position: 'relative', height: 160 }}>
                                                            <img 
                                                                src={p.images?.[0] || 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80'} 
                                                                alt={p.title}
                                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                            />
                                                            <Chip 
                                                                label={p.isApproved ? 'Approved' : 'Pending Approval'} 
                                                                size="small" 
                                                                color={p.isApproved ? 'success' : 'warning'}
                                                                sx={{ position: 'absolute', top: 12, left: 12, fontWeight: 700, borderRadius: 2 }}
                                                            />
                                                        </Box>
                                                        <CardContent sx={{ p: 2.5 }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1f2937', mb: 0.5, lineClamp: 1, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {p.title}
                                                            </Typography>
                                                            <Typography variant="caption" sx={{ color: '#9ca3af', display: '-webkit-box', mb: 2, WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {p.address}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3b82f6' }}>LKR {p.pricePerMonth.toLocaleString()}</Typography>
                                                                <Typography variant="caption" sx={{ bgcolor: '#f3f4f6', px: 1, py: 0.5, borderRadius: 1.5, fontWeight: 700, color: '#4b5563' }}>{p.roomType}</Typography>
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                                <Button 
                                                                    fullWidth 
                                                                    variant="outlined" 
                                                                    size="small" 
                                                                    onClick={() => handleEditProperty(p._id)}
                                                                    sx={{ borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                                                                >
                                                                    Edit
                                                                </Button>
                                                                <Button 
                                                                    variant="outlined" 
                                                                    color="error" 
                                                                    size="small" 
                                                                    onClick={() => handleDeleteProperty(p._id)}
                                                                    sx={{ borderRadius: 2, minWidth: 40 }}
                                                                >
                                                                    🗑️
                                                                </Button>
                                                            </Box>
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </Box>
                            ) : (
                                <Box className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                     {/* Pass the ID for editing mode or null for add mode */}
                                     {editingBoardingId ? (
                                        <div className="p-4">
                                            {/* We need to update AddEditBoardingPage to accept an 'id' prop or use routing */}
                                            {/* Since AddEditBoardingPage currently uses useParams(), we might need a small refactor there too */}
                                            {/* For now, let's assume we can navigate or pass it */}
                                            <Typography variant="body2" sx={{ mb: 2, color: '#6b7280', cursor: 'pointer', '&:hover': { color: '#3b82f6' } }} onClick={handleFormClose}>← Back to list</Typography>
                                            <AddEditBoardingPage onClose={handleFormClose} editId={editingBoardingId} />
                                        </div>
                                     ) : (
                                        <div className="p-4">
                                            <Typography variant="body2" sx={{ mb: 2, color: '#6b7280', cursor: 'pointer', '&:hover': { color: '#3b82f6' } }} onClick={handleFormClose}>← Back to list</Typography>
                                            <AddEditBoardingPage onClose={handleFormClose} />
                                        </div>
                                     )}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* ── Students Tab ── */}
                    {activeTab === 'students' && (
                        <Box className="min-h-[500px]">
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                <div>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937' }}>Student Management</Typography>
                                    <Typography variant="body2" sx={{ color: '#9ca3af' }}>Manage students staying in your properties</Typography>
                                </div>
                                <Button 
                                    variant="contained" 
                                    startIcon={<AddIcon />} 
                                    onClick={() => setAssigningStudent(true)}
                                    sx={{ borderRadius: 3, textTransform: 'none', px: 3, fontWeight: 700 }}
                                >
                                    Assign New Student
                                </Button>
                            </Box>

                            {assigningStudent && (
                                <Paper sx={{ p: 4, borderRadius: 4, mb: 4, border: '1px solid #e5e7eb' }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>Assign Student to Property</Typography>
                                    <form onSubmit={handleAddTenancy}>
                                        <Grid container spacing={3}>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', mb: 1, display: 'block' }}>STUDENT EMAIL *</Typography>
                                                <input 
                                                    type="email" 
                                                    required 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
                                                    placeholder="student@example.com"
                                                    value={studentFormData.studentEmail}
                                                    onChange={(e) => setStudentFormData({ ...studentFormData, studentEmail: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', mb: 1, display: 'block' }}>SELECT PROPERTY *</Typography>
                                                <select 
                                                    required 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
                                                    value={studentFormData.boardingId}
                                                    onChange={(e) => setStudentFormData({ ...studentFormData, boardingId: e.target.value })}
                                                >
                                                    <option value="">Choose a property...</option>
                                                    {boardings.filter(b => b.isApproved).map(b => (
                                                        <option key={b._id} value={b._id}>{b.title}</option>
                                                    ))}
                                                </select>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', mb: 1, display: 'block' }}>STUDENT NAME</Typography>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
                                                    placeholder="Enter student name"
                                                    value={studentFormData.studentName}
                                                    onChange={(e) => setStudentFormData({ ...studentFormData, studentName: e.target.value })}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#6b7280', mb: 1, display: 'block' }}>STUDENT PHONE</Typography>
                                                <input 
                                                    type="text" 
                                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm"
                                                    placeholder="Enter phone number"
                                                    value={studentFormData.studentPhone}
                                                    onChange={(e) => setStudentFormData({ ...studentFormData, studentPhone: e.target.value })}
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                            <Button onClick={() => setAssigningStudent(false)} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Cancel</Button>
                                            <Button type="submit" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 4 }}>Confirm Assignment</Button>
                                        </Box>
                                    </form>
                                </Paper>
                            )}

                            <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned Date</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {tenancies.length > 0 ? tenancies.map((t) => (
                                                <tr key={t._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar sx={{ width: 32, height: 32, bgcolor: '#eff6ff', color: '#3b82f6', fontSize: '0.875rem' }}>{t.studentName?.[0] || t.studentEmail[0].toUpperCase()}</Avatar>
                                                            <div>
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{t.studentName || 'Unnamed Student'}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#9ca3af' }}>{t.studentEmail}</Typography>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4b5563' }}>{t.boardingId?.title}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{t.boardingId?.address}</Typography>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Typography variant="body2" sx={{ color: '#4b5563' }}>{new Date(t.createdAt).toLocaleDateString()}</Typography>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Button 
                                                            size="small" 
                                                            color="error" 
                                                            onClick={() => handleRemoveTenancy(t._id)}
                                                            sx={{ minWidth: 0, p: 1, borderRadius: 2 }}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                                                        <TenantsIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                                                        <Typography variant="body2">No students assigned yet</Typography>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Paper>
                        </Box>
                    )}

                    {/* ── Payments Tab ── */}
                    {activeTab === 'payments' && (
                        <Box className="min-h-[500px]">
                            <Box sx={{ mb: 4 }}>
                                <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937' }}>Payment Tracking</Typography>
                                <Typography variant="body2" sx={{ color: '#9ca3af' }}>Review and verify payment slips from your tenants</Typography>
                            </Box>

                            {/* Pending Payments */}
                            {payments.filter(p => p.status === 'Pending').length > 0 && (
                                <Box sx={{ mb: 6 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BellIcon fontSize="small" /> Pending Review
                                    </Typography>
                                    <Grid container spacing={3}>
                                        {payments.filter(p => p.status === 'Pending').map((p) => (
                                            <Grid item xs={12} md={6} key={p._id}>
                                                <Card sx={{ borderRadius: 4, border: '1px solid #fef3c7', bgcolor: '#fffcf5' }}>
                                                    <CardContent sx={{ p: 3 }}>
                                                        <Box sx={{ display: 'flex', gap: 2 }}>
                                                            <Box 
                                                                component="a" 
                                                                href={p.slipImage} 
                                                                target="_blank"
                                                                sx={{ 
                                                                    width: 80, 
                                                                    height: 80, 
                                                                    borderRadius: 2, 
                                                                    overflow: 'hidden', 
                                                                    border: '2px solid #fff', 
                                                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                                                    cursor: 'pointer',
                                                                    flexShrink: 0
                                                                }}
                                                            >
                                                                <img src={p.slipImage} alt="Slip" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                            </Box>
                                                            <Box sx={{ flexGrow: 1 }}>
                                                                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#1f2937' }}>{p.studentId?.name || p.studentId?.email}</Typography>
                                                                <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>Property: {p.boardingId?.title}</Typography>
                                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#1e40af' }}>LKR {p.amount.toLocaleString()}</Typography>
                                                                    <Typography variant="caption" sx={{ bgcolor: '#eef2ff', px: 1, py: 0.2, borderRadius: 1, fontWeight: 700, color: '#4338ca' }}>{p.month}</Typography>
                                                                </Box>
                                                            </Box>
                                                        </Box>
                                                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                                            <Button 
                                                                fullWidth 
                                                                variant="contained" 
                                                                color="success" 
                                                                startIcon={<CheckCircleIcon />}
                                                                onClick={() => handleUpdatePaymentStatus(p._id, 'Approved')}
                                                                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                                                            >
                                                                Approve
                                                            </Button>
                                                            <Button 
                                                                fullWidth 
                                                                variant="outlined" 
                                                                color="error" 
                                                                startIcon={<CancelIcon />}
                                                                onClick={() => handleUpdatePaymentStatus(p._id, 'Rejected')}
                                                                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                                                            >
                                                                Reject
                                                            </Button>
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Box>
                            )}

                            {/* Payment History */}
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937', mb: 2 }}>Payment History</Typography>
                            <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', overflow: 'hidden' }}>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Month</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.length > 0 ? payments.map((p) => (
                                                <tr key={p._id} className="hover:bg-gray-50/50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{p.studentId?.name || 'Student'}</Typography>
                                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{p.studentId?.email}</Typography>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#4b5563' }}>{p.boardingId?.title}</Typography>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Chip label={p.month} size="small" sx={{ fontWeight: 700, fontSize: '0.65rem', borderRadius: 1 }} />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>LKR {p.amount.toLocaleString()}</Typography>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Chip 
                                                            label={p.status} 
                                                            size="small" 
                                                            color={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}
                                                            sx={{ fontWeight: 700, height: 24, fontSize: '0.65rem' }}
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{new Date(p.createdAt).toLocaleDateString()}</Typography>
                                                    </td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                                                        <ReceiptIcon sx={{ fontSize: 40, mb: 1, opacity: 0.5 }} />
                                                        <Typography variant="body2">No payment records found</Typography>
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Paper>
                        </Box>
                    )}

                    {/* ── Appointments Tab ── */}
                    {activeTab === 'appointments' && (
                        <Box className="bg-white rounded-2xl border border-gray-100 overflow-hidden min-h-[500px]">
                            <OwnerDashboard embeddedOwnerId={user?.id} />
                        </Box>
                    )}

                    {/* ── Profile Tab ── */}
                    {activeTab === 'profile' && (
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>My Profile</Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>Manage your personal details and account settings</Typography>

                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6', textAlign: 'center', p: 4 }}>
                                        <Avatar
                                            src={user?.facePhoto}
                                            sx={{
                                                width: 100, height: 100, bgcolor: '#dbeafe', color: '#2563eb',
                                                fontSize: '2.5rem', fontWeight: 700, mx: 'auto', mb: 2, border: '4px solid #f3f4f6'
                                            }}
                                        >
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                        </Avatar>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>{user?.name || 'Owner'}</Typography>
                                        <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>Boarding Owner</Typography>
                                        <Chip
                                            label={user?.status || 'Active'}
                                            size="small"
                                            color={user?.status === 'Pending' ? 'warning' : 'success'}
                                            sx={{ fontWeight: 700, borderRadius: 2 }}
                                        />
                                    </Card>
                                </Grid>

                                <Grid item xs={12} md={8}>
                                    <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6' }}>
                                        <CardContent sx={{ p: 4 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 3 }}>Personal Information</Typography>
                                            <Grid container spacing={3}>
                                                {[
                                                    { label: 'Full Name', value: user?.name || 'Not provided' },
                                                    { label: 'Email Address', value: user?.email },
                                                    { label: 'Phone Number', value: user?.phoneNumber || 'Not provided' },
                                                    { label: 'User Role', value: user?.role },
                                                    { label: 'Account Status', value: user?.status || 'Active' },
                                                    { label: 'Joined On', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A' },
                                                ].map((field, i) => (
                                                    <Grid item xs={12} sm={6} key={i}>
                                                        <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{field.label}</Typography>
                                                        <Typography sx={{ fontWeight: 500, color: '#374151' }}>{field.value}</Typography>
                                                    </Grid>
                                                ))}
                                            </Grid>

                                            <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 2 }}>
                                                <Button variant="outlined" color="error" sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }} onClick={handleLogout}>Logout</Button>
                                            </Box>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </main>
            </div>
        </div>
    );
};

export default BoardingOwnerDashboard;
