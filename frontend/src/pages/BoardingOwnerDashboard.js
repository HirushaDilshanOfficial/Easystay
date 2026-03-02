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
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import notificationService from '../services/notificationService';

const BoardingOwnerDashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};
    const [activeTab, setActiveTab] = useState('dashboard');
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadNotifications();
    }, []);

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

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const sidebarItems = [
        { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
        { id: 'properties', label: 'My Properties', icon: <ApartmentIcon fontSize="small" /> },
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
                                { label: 'Total Properties', value: '0', sub: 'No properties yet', icon: <ApartmentIcon sx={{ color: '#3b82f6', fontSize: 22 }} />, bg: '#eff6ff', hover: 'rgba(59,130,246,0.12)' },
                                { label: 'Active Tenants', value: '0', sub: 'No tenants yet', icon: <TenantsIcon sx={{ color: '#10b981', fontSize: 22 }} />, bg: '#ecfdf5', hover: 'rgba(16,185,129,0.12)' },
                                { label: 'Monthly Revenue', value: 'LKR 0', sub: 'Start earning', icon: <MoneyIcon sx={{ color: '#f59e0b', fontSize: 22 }} />, bg: '#fffbeb', hover: 'rgba(245,158,11,0.12)' },
                                { label: 'Avg. Rating', value: '—', sub: 'No reviews yet', icon: <StarIcon sx={{ color: '#8b5cf6', fontSize: 22 }} />, bg: '#f5f3ff', hover: 'rgba(139,92,246,0.12)' },
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
                                            {['Add your first property listing', 'Upload high-quality photos', 'Set competitive pricing to attract tenants'].map((tip, i) => (
                                                <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
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
                        <Box>
                            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>My Properties</Typography>
                            <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>Manage and list your boarding places</Typography>
                            <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #eff6ff, #f5f3ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                    <ApartmentIcon sx={{ fontSize: 48, color: '#93c5fd' }} />
                                </Box>
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>No Properties Listed</Typography>
                                <Typography variant="body1" sx={{ color: '#9ca3af', maxWidth: 420, mb: 4 }}>
                                    You haven't added any boarding places yet. Start listing your property to connect with SLIIT students looking for a place to stay.
                                </Typography>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    sx={{ bgcolor: '#3b82f6', fontWeight: 700, borderRadius: 3, px: 5, py: 1.5, textTransform: 'none', boxShadow: '0 4px 14px rgba(59,130,246,0.4)', '&:hover': { bgcolor: '#2563eb' } }}
                                >
                                    Add Your First Property
                                </Button>
                            </Paper>
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
