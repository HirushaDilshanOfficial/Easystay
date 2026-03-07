import React, { useState, useEffect } from 'react';
import {
    Typography,
    Button,
    Paper,
    Grid,
    Card,
    CardContent,
    Avatar,
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip
} from '@mui/material';
import {
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    Person as PersonIcon,
    Refresh as RefreshIcon,
    Visibility as ViewIcon,
    Description as DocIcon,
    Apartment as ApartmentIcon,
    Search as SearchIcon,
    FavoriteBorder as FavoriteIcon,
    NotificationsActive as BellIcon,
    Stars as StarsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import notificationService from '../services/notificationService';

const Dashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');

    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        if (isAdmin) {
            loadAdminData();
        } else {
            loadStudentData();
        }
    }, [isAdmin]);

    const loadStudentData = async () => {
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

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData] = await Promise.all([
                userService.getStats(),
                userService.getUsers()
            ]);
            setStats(statsData.data);
            setUsers(usersData.data);
        } catch (err) {
            setError('Failed to load dashboard data.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await userService.updateUserStatus(id, status);
            loadAdminData(); // Refresh data
        } catch (err) {
            setError('Failed to update user status.');
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationService.markAllAsRead();
            loadStudentData();
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
            default: return { color: '#4f46e5', bg: '#eef2ff' };
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'success';
            case 'Pending': return 'warning';
            case 'Rejected': return 'error';
            default: return 'default';
        }
    };

    const getRoleColor = (role) => {
        switch (role) {
            case 'Admin': return 'bg-red-500';
            case 'Student': return 'bg-green-500';
            case 'BoardingOwner': return 'bg-blue-500';
            default: return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <Box className="min-h-screen flex items-center justify-center bg-gray-50">
                <CircularProgress color="indigo" />
            </Box>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
                <div className="p-6">
                    <Typography variant="h6" className="font-bold text-indigo-600 flex items-center gap-2">
                        <HomeIcon /> EasyStay
                    </Typography>
                </div>
                <div className="flex-1 px-4 space-y-1 mt-4">
                    <div onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3 rounded-xl font-medium cursor-pointer transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <DashboardIcon fontSize="small" /> Dashboard
                    </div>
                    {!isAdmin && (
                        <div onClick={() => setActiveTab('myboarding')} className={`flex items-center gap-3 p-3 rounded-xl font-medium cursor-pointer transition-all duration-200 ${activeTab === 'myboarding' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                            <ApartmentIcon fontSize="small" /> My Boarding
                        </div>
                    )}
                    {isAdmin && (
                        <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer transition-all duration-200">
                            <PeopleIcon fontSize="small" /> User Management
                        </div>
                    )}
                    <div onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 p-3 rounded-xl font-medium cursor-pointer transition-all duration-200 ${activeTab === 'profile' ? 'bg-indigo-50 text-indigo-600 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                        <PersonIcon fontSize="small" /> Profile
                    </div>
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
                        {isAdmin ? 'Admin Dashboard' : `Welcome, ${user?.email?.split('@')[0]}`}
                    </Typography>
                    <div className="flex items-center gap-4">
                        {isAdmin && (
                            <IconButton onClick={loadAdminData} size="small" className="text-gray-400">
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        )}
                        <div className={`px-3 py-1 rounded-full text-white text-xs font-bold ${getRoleColor(user?.role)}`}>
                            {user?.role}
                        </div>
                        <Avatar className="bg-indigo-100 text-indigo-600">
                            {user?.email?.[0].toUpperCase()}
                        </Avatar>
                    </div>
                </header>

                <main className="p-8">
                    {error && <Alert severity="error" className="mb-6 rounded-xl">{error}</Alert>}

                    {isAdmin ? (
                        <>
                            {/* Stats */}
                            <Grid container spacing={4} className="mb-8">
                                <Grid item xs={12} md={3}>
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                        <CardContent className="p-6">
                                            <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                                Total Users
                                            </Typography>
                                            <Typography variant="h4" className="font-bold text-gray-800">{stats?.totalUsers}</Typography>
                                            <Typography variant="body2" className="text-gray-400 mt-2">All registered accounts</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm border-l-4 border-l-amber-500">
                                        <CardContent className="p-6">
                                            <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                                Pending Approvals
                                            </Typography>
                                            <Typography variant="h4" className="font-bold text-amber-600">{stats?.pendingOwners}</Typography>
                                            <Typography variant="body2" className="text-gray-400 mt-2">Boarding Owners</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                        <CardContent className="p-6">
                                            <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                                Active Owners
                                            </Typography>
                                            <Typography variant="h4" className="font-bold text-indigo-600">{stats?.activeOwners}</Typography>
                                            <Typography variant="body2" className="text-gray-400 mt-2">Approved properties</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                        <CardContent className="p-6">
                                            <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                                Students
                                            </Typography>
                                            <Typography variant="h4" className="font-bold text-green-600">{stats?.totalStudents}</Typography>
                                            <Typography variant="body2" className="text-gray-400 mt-2">SLIIT email verified</Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* Pending Approvals Section */}
                            {users.filter(u => u.role === 'BoardingOwner' && u.status === 'Pending').length > 0 && (
                                <Box className="mb-8">
                                    <Typography variant="h6" className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <CheckIcon className="text-amber-500" fontSize="small" /> Pending Approvals
                                    </Typography>
                                    <TableContainer component={Paper} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                        <Table>
                                            <TableHead className="bg-gray-50">
                                                <TableRow>
                                                    <TableCell className="font-bold">Name</TableCell>
                                                    <TableCell className="font-bold">Email</TableCell>
                                                    <TableCell className="font-bold">Phone</TableCell>
                                                    <TableCell className="font-bold">Documents</TableCell>
                                                    <TableCell className="font-bold" align="center">Actions</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {users.filter(u => u.role === 'BoardingOwner' && u.status === 'Pending').map((row) => (
                                                    <TableRow key={row._id} hover>
                                                        <TableCell>{row.name}</TableCell>
                                                        <TableCell>{row.email}</TableCell>
                                                        <TableCell>{row.phoneNumber}</TableCell>
                                                        <TableCell>
                                                            <div className="flex gap-1">
                                                                {row.nicPhoto && (
                                                                    <Tooltip title="View NIC">
                                                                        <IconButton size="small" component="a" href={row.nicPhoto} target="_blank" className="text-indigo-600">
                                                                            <ViewIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.facePhoto && (
                                                                    <Tooltip title="View Face">
                                                                        <IconButton size="small" component="a" href={row.facePhoto} target="_blank" className="text-blue-600">
                                                                            <ViewIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.boardingDocuments?.map((doc, index) => (
                                                                    <Tooltip key={index} title={`Boarding Doc ${index + 1}`}>
                                                                        <IconButton size="small" component="a" href={doc} target="_blank" className="text-amber-600">
                                                                            <DocIcon fontSize="inherit" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                ))}
                                                            </div>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    variant="contained"
                                                                    color="success"
                                                                    size="small"
                                                                    className="rounded-lg capitalize"
                                                                    onClick={() => handleUpdateStatus(row._id, 'Active')}
                                                                >
                                                                    Approve
                                                                </Button>
                                                                <Button
                                                                    variant="outlined"
                                                                    color="error"
                                                                    size="small"
                                                                    className="rounded-lg capitalize"
                                                                    onClick={() => handleUpdateStatus(row._id, 'Rejected')}
                                                                >
                                                                    Reject
                                                                </Button>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Box>
                            )}

                            {/* All Users Table */}
                            <Box>
                                <Typography variant="h6" className="font-bold text-gray-800 mb-4">All Registered Users</Typography>
                                <TableContainer component={Paper} className="rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                    <Table>
                                        <TableHead className="bg-gray-50">
                                            <TableRow>
                                                <TableCell className="font-bold">User</TableCell>
                                                <TableCell className="font-bold">Role</TableCell>
                                                <TableCell className="font-bold">Joined</TableCell>
                                                <TableCell className="font-bold">Status</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {users.map((row) => (
                                                <TableRow key={row._id} hover>
                                                    <TableCell>
                                                        <Box className="flex items-center gap-3">
                                                            <Avatar className="bg-gray-100 text-gray-600 w-8 h-8 text-xs">
                                                                {row.name[0]}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" className="font-medium">{row.name}</Typography>
                                                                <Typography variant="caption" className="text-gray-400">{row.email}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.role}
                                                            size="small"
                                                            className={`text-[10px] font-bold ${row.role === 'Admin' ? 'bg-red-50 text-red-600' : row.role === 'Student' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2" className="text-gray-500">
                                                            {new Date(row.createdAt).toLocaleDateString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={row.status}
                                                            size="small"
                                                            color={getStatusColor(row.status)}
                                                            className="text-[10px] font-bold"
                                                        />
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </Box>
                        </>
                    ) : (
                        /* Student Dashboard Content */
                        <>
                            {activeTab === 'dashboard' && (
                                <Grid container spacing={3}>
                                    {/* Hero Banner */}
                                    <Grid item xs={12}>
                                        <Paper className="p-8 rounded-2xl shadow-sm overflow-hidden relative" sx={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%)' }}>
                                            <Box className="relative z-10">
                                                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', fontSize: '0.7rem', mb: 1 }}>
                                                    Welcome back
                                                </Typography>
                                                <Typography variant="h4" sx={{ fontWeight: 800, color: '#fff', mb: 1 }}>
                                                    Hey, {user?.name || user?.email?.split('@')[0]} 👋
                                                </Typography>
                                                <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', maxWidth: 500 }}>
                                                    Find and manage your perfect boarding place. Your comfort, our priority.
                                                </Typography>
                                                <Button variant="contained" startIcon={<SearchIcon />} sx={{ mt: 3, bgcolor: '#fff', color: '#4f46e5', fontWeight: 700, borderRadius: 3, px: 4, py: 1.2, textTransform: 'none', '&:hover': { bgcolor: 'rgba(255,255,255,0.9)' } }}>
                                                    Explore Places
                                                </Button>
                                            </Box>
                                            <Box sx={{ position: 'absolute', right: -20, top: -20, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
                                            <Box sx={{ position: 'absolute', right: 60, bottom: -40, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                        </Paper>
                                    </Grid>

                                    {/* Stat Cards */}
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(79,70,229,0.12)' } }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <ApartmentIcon sx={{ color: '#4f46e5', fontSize: 22 }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>My Boarding</Typography>
                                                </Box>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1f2937' }}>—</Typography>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>No active boarding</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', transition: 'all 0.3s', '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(239,68,68,0.12)' } }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#fef2f2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <FavoriteIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>Saved Places</Typography>
                                                </Box>
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1f2937' }}>0</Typography>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>Browse to save places</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} sm={4}>
                                        <Card sx={{
                                            borderRadius: 4,
                                            border: '1px solid rgba(245, 158, 11, 0.1)',
                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                            transition: 'all 0.3s',
                                            background: 'linear-gradient(135deg, #fff 0%, #fffbeb 100%)',
                                            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 24px rgba(245, 158, 11, 0.15)' }
                                        }}>
                                            <CardContent sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                                    <Box sx={{ width: 44, height: 44, borderRadius: 3, bgcolor: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                                                        <StarsIcon sx={{ color: '#f59e0b', fontSize: 22 }} />
                                                    </Box>
                                                    <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: '#9ca3af' }}>Loyalty Points</Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
                                                    <Typography variant="h3" sx={{ fontWeight: 800, color: '#1f2937' }}>
                                                        {user?.loyaltyPoints || 0}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>PTS</Typography>
                                                </Box>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>Available Balance</Typography>
                                            </CardContent>
                                        </Card>
                                    </Grid>

                                    {/* Tips & Notifications Row */}
                                    <Grid item xs={12} md={6}>
                                        <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', overflow: 'hidden', background: 'linear-gradient(135deg, #faf5ff 0%, #eef2ff 100%)', height: '100%' }}>
                                            <Box sx={{ p: 4 }}>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>💡 Tips for Finding the Best Place</Typography>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                                    {['Check reviews from other SLIIT students', 'Compare prices in different areas near campus', 'Visit the place before making a commitment'].map((tip, i) => (
                                                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                                            <Box sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: '#4f46e5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</Box>
                                                            <Typography variant="body2" sx={{ color: '#4b5563', fontWeight: 500 }}>{tip}</Typography>
                                                        </Box>
                                                    ))}
                                                </Box>
                                            </Box>
                                        </Paper>
                                    </Grid>

                                    <Grid item xs={12} md={6}>
                                        <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', overflow: 'hidden', bgcolor: '#fff', height: '100%' }}>
                                            <Box sx={{ p: 3, borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                    <BellIcon sx={{ color: '#f59e0b' }} fontSize="small" />
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#1f2937' }}>Recent Notifications</Typography>
                                                </Box>
                                                {notifications.some(n => !n.isRead) && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: '#4f46e5', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                                                        onClick={handleMarkAllRead}
                                                    >
                                                        Mark all as read
                                                    </Typography>
                                                )}
                                            </Box>
                                            <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 320, overflowY: 'auto' }}>
                                                {notifications.length > 0 ? (
                                                    notifications.map((note) => {
                                                        const styles = getNoteStyles(note.type);
                                                        return (
                                                            <Box
                                                                key={note._id}
                                                                sx={{
                                                                    p: 1.5,
                                                                    borderRadius: 3,
                                                                    transition: 'bgcolor 0.2s',
                                                                    '&:hover': { bgcolor: '#f9fafb' },
                                                                    cursor: 'pointer',
                                                                    display: 'flex',
                                                                    gap: 2,
                                                                    position: 'relative',
                                                                    bgcolor: note.isRead ? 'transparent' : 'rgba(79, 70, 229, 0.03)'
                                                                }}
                                                            >
                                                                {!note.isRead && (
                                                                    <Box sx={{ position: 'absolute', right: 12, top: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: '#4f46e5' }} />
                                                                )}
                                                                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: styles.bg, color: styles.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                                                    <BellIcon sx={{ fontSize: 18 }} />
                                                                </Box>
                                                                <Box sx={{ flexGrow: 1 }}>
                                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 700, color: '#1f2937' }}>{note.title}</Typography>
                                                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>{formatTime(note.createdAt)}</Typography>
                                                                    </Box>
                                                                    <Typography variant="caption" sx={{ color: '#6b7280', display: 'block', lineHeight: 1.4 }}>{note.description}</Typography>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })
                                                ) : (
                                                    <Box sx={{ py: 4, textAlign: 'center' }}>
                                                        <Typography variant="caption" sx={{ color: '#9ca3af' }}>No notifications yet</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                        </Paper>
                                    </Grid>
                                </Grid>
                            )}

                            {activeTab === 'myboarding' && (
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>My Boarding</Typography>
                                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>Manage your current boarding place</Typography>
                                    <Paper sx={{ borderRadius: 4, border: '1px solid #f3f4f6', p: 6, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        <Box sx={{ width: 100, height: 100, borderRadius: '50%', background: 'linear-gradient(135deg, #eef2ff, #faf5ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                                            <ApartmentIcon sx={{ fontSize: 48, color: '#a5b4fc' }} />
                                        </Box>
                                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#1f2937', mb: 1 }}>No Active Boarding</Typography>
                                        <Typography variant="body1" sx={{ color: '#9ca3af', maxWidth: 420, mb: 4 }}>
                                            You haven't joined any boarding yet. Explore available places and find your perfect stay near SLIIT campus.
                                        </Typography>
                                        <Button variant="contained" startIcon={<SearchIcon />} sx={{ bgcolor: '#4f46e5', fontWeight: 700, borderRadius: 3, px: 5, py: 1.5, textTransform: 'none', boxShadow: '0 4px 14px rgba(79,70,229,0.4)', '&:hover': { bgcolor: '#4338ca' } }}>
                                            Find a Place
                                        </Button>
                                    </Paper>
                                </Box>
                            )}

                            {activeTab === 'profile' && (
                                <Box>
                                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>My Profile</Typography>
                                    <Typography variant="body2" sx={{ color: '#9ca3af', mb: 4 }}>Manage your personal details and account settings</Typography>

                                    <Grid container spacing={3}>
                                        <Grid item xs={12} md={4}>
                                            <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6', textAlign: 'center', p: 4 }}>
                                                <Avatar
                                                    sx={{
                                                        width: 100,
                                                        height: 100,
                                                        bgcolor: 'indigo.100',
                                                        color: 'indigo.600',
                                                        fontSize: '2.5rem',
                                                        fontWeight: 700,
                                                        mx: 'auto',
                                                        mb: 2,
                                                        border: '4px solid #f3f4f6'
                                                    }}
                                                >
                                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
                                                </Avatar>
                                                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937' }}>{user?.name || 'Student'}</Typography>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', mb: 3 }}>{user?.role}</Typography>
                                                <Chip
                                                    label={user?.status || 'Active'}
                                                    size="small"
                                                    color="success"
                                                    sx={{ fontWeight: 700, borderRadius: 2 }}
                                                />
                                            </Card>
                                        </Grid>

                                        <Grid item xs={12} md={8}>
                                            <Card sx={{ borderRadius: 4, border: '1px solid #f3f4f6' }}>
                                                <CardContent sx={{ p: 4 }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1f2937', mb: 3 }}>Personal Information</Typography>
                                                    <Grid container spacing={3}>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Full Name</Typography>
                                                            <Typography sx={{ fontWeight: 500, color: '#374151' }}>{user?.name || 'Not provided'}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Email Address</Typography>
                                                            <Typography sx={{ fontWeight: 500, color: '#374151' }}>{user?.email}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>User Role</Typography>
                                                            <Typography sx={{ fontWeight: 500, color: '#374151' }}>{user?.role}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} sm={6}>
                                                            <Typography sx={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>Joined On</Typography>
                                                            <Typography sx={{ fontWeight: 500, color: '#374151' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</Typography>
                                                        </Grid>
                                                    </Grid>

                                                    <Box sx={{ mt: 5, pt: 3, borderTop: '1px solid #f3f4f6', display: 'flex', gap: 2 }}>
                                                        <Button variant="contained" color="error" sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600, boxShadow: 'none', '&:hover': { boxShadow: 'none', bgcolor: '#d32f2f' } }} onClick={handleLogout}>Logout</Button>
                                                    </Box>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    </Grid>
                                </Box>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
};

// Simple icon for pending approvals
const CheckIcon = ({ className, fontSize }) => (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
);

export default Dashboard;
