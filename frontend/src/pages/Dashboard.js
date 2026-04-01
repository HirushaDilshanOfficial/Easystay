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
    Tooltip,
    Modal,
    TextField,
    Divider
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
    Stars as StarsIcon,
    CloudUpload as UploadIcon,
    Receipt as ReceiptIcon,
    CalendarMonth as CalendarIcon,
    LocationOn as MapIcon,
    MeetingRoom as RoomIcon,
    SupervisedUserCircle as ManagerIcon,
    History as HistoryIcon,
    AttachMoney as MoneyIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import notificationService from '../services/notificationService';
import api from '../api';

const Dashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [myBoarding, setMyBoarding] = useState(null);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [activeTab, setActiveTab] = useState('dashboard');
    const [profile, setProfile] = useState(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentData, setPaymentData] = useState({
        month: '',
        amount: '',
        slip: null,
        useReward: false,
        pointsUsed: 0
    });

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
            const [notes, boardingRes, paymentsRes, profileRes] = await Promise.all([
                notificationService.getNotifications(),
                api.get('/tenancy/my-boarding'),
                api.get('/payments/my-payments'),
                api.get('/auth/me')
            ]);
            setNotifications(notes.data);
            setMyBoarding(boardingRes.data.data);
            setPayments(paymentsRes.data.data);
            setProfile(profileRes.data.data);
        } catch (err) {
            console.error('Failed to load student data:', err);
            setError('Failed to sync dashboard data. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    };

    const handleUploadSlip = async (e) => {
        e.preventDefault();
        if (!paymentData.slip || !paymentData.month || !paymentData.amount) {
            setError('Please fill all fields and select a slip image');
            return;
        }

        setUploading(true);
        setError('');
        
        try {
            const formData = new FormData();
            formData.append('tenancyId', myBoarding._id);
            formData.append('month', paymentData.month);
            formData.append('amount', paymentData.amount);
            formData.append('slipImage', paymentData.slip);
            formData.append('useReward', paymentData.pointsUsed > 0);
            formData.append('pointsUsed', paymentData.pointsUsed);

            await api.post('/payments/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess('Payment slip uploaded successfully!');
            setShowPaymentModal(false);
            setPaymentData({ month: '', amount: '', slip: null, useReward: false, pointsUsed: 0 });
            loadStudentData(); // Refresh
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to upload slip');
        } finally {
            setUploading(false);
        }
    };

    const getNextPaymentDate = (startDate) => {
        if (!startDate) return 'N/A';
        const start = new Date(startDate);
        const now = new Date();
        
        let nextPayment = new Date(start);
        while (nextPayment <= now) {
            nextPayment.setMonth(nextPayment.getMonth() + 1);
        }
        return nextPayment.toLocaleDateString();
    };

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [statsData, usersData, profileRes] = await Promise.all([
                userService.getStats(),
                userService.getUsers(),
                api.get('/auth/me')
            ]);
            setStats(statsData.data);
            setUsers(usersData.data);
            setProfile(profileRes.data.data);
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
                <CircularProgress color="primary" />
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
                    <div onClick={() => navigate('/')} className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl font-medium cursor-pointer transition-all duration-200">
                        <HomeIcon fontSize="small" /> Home
                    </div>
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
                    {error && <Alert severity="error" className="mb-6 rounded-xl" onClose={() => setError('')}>{error}</Alert>}
                    {success && <Alert severity="success" className="mb-6 rounded-xl" onClose={() => setSuccess('')}>{success}</Alert>}

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
                                                <Typography variant="h3" sx={{ fontWeight: 800, color: '#1f2937' }}>{myBoarding ? '1' : '—'}</Typography>
                                                <Typography variant="body2" sx={{ color: '#9ca3af', mt: 1 }}>{myBoarding ? 'Active stays' : 'No active boarding'}</Typography>
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
                                                        {profile?.loyaltyPoints || 0}
                                                    </Typography>
                                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f59e0b', fontSize: '0.9rem' }}>PTS</Typography>
                                                    {profile?.loyaltyPoints >= 12 && (
                                                        <Chip 
                                                            label="Discount Ready!" 
                                                            size="small" 
                                                            color="success" 
                                                            sx={{ ml: 1, fontWeight: 800, fontSize: '0.6rem', height: 20 }} 
                                                        />
                                                    )}
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
                                                                    transition: 'background-color 0.2s',
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
                                    {/* ── My Boarding Modern Redesign ── */}
                                    {!myBoarding ? (
                                        <Paper sx={{ 
                                            borderRadius: 6, 
                                            border: '1px solid #e2e8f0', 
                                            p: 8, 
                                            textAlign: 'center', 
                                            display: 'flex', 
                                            flexDirection: 'column', 
                                            alignItems: 'center',
                                            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                                        }}>
                                            <Box sx={{ 
                                                width: 120, height: 120, borderRadius: '40%', 
                                                background: 'linear-gradient(135deg, #e0e7ff, #ede9fe)', 
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                                mb: 4, transform: 'rotate(-5deg)',
                                                boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                                            }}>
                                                <ApartmentIcon sx={{ fontSize: 60, color: '#6366f1' }} />
                                            </Box>
                                            <Typography variant="h4" sx={{ fontWeight: 900, color: '#1e293b', mb: 1.5, fontFamily: "'Inter', sans-serif" }}>No Active Boarding</Typography>
                                            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 480, mb: 5, lineHeight: 1.6 }}>
                                                It looks like you haven't been assigned to a property yet. Reach out to your boarding owner to get registered, or browse for new places!
                                            </Typography>
                                            <Button 
                                                variant="contained" 
                                                startIcon={<SearchIcon />} 
                                                onClick={() => navigate('/')} 
                                                sx={{ 
                                                    bgcolor: '#4f46e5', fontWeight: 800, borderRadius: 4, px: 6, py: 2, 
                                                    textTransform: 'none', fontSize: '1rem',
                                                    boxShadow: '0 10px 15px -3px rgba(79,70,229,0.4)',
                                                    '&:hover': { bgcolor: '#4338ca', transform: 'translateY(-2px)' },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                Explore Accommodations
                                            </Button>
                                        </Paper>
                                    ) : (
                                        <Grid container spacing={4}>
                                            {/* Left Column: Hero & Stats */}
                                            <Grid item xs={12} md={7}>
                                                {/* Hero Header Card */}
                                                <Card sx={{ 
                                                    borderRadius: 6, overflow: 'hidden', border: 'none', 
                                                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', 
                                                    position: 'relative', mb: 4 
                                                }}>
                                                    <Box sx={{ height: 400, position: 'relative' }}>
                                                        <img 
                                                            src={myBoarding?.boardingId?.images?.[0] 
                                                                ? (myBoarding.boardingId.images[0].startsWith('http') 
                                                                    ? myBoarding.boardingId.images[0] 
                                                                    : (myBoarding.boardingId.images[0].startsWith('uploads/') 
                                                                        ? `http://localhost:5001/${myBoarding.boardingId.images[0]}`
                                                                        : `http://localhost:5001/uploads/${myBoarding.boardingId.images[0]}`))
                                                                : 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80'} 
                                                            alt={myBoarding?.boardingId?.title}
                                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                                        />
                                                        {/* Glassmorphic Overlay */}
                                                        <Box sx={{ 
                                                            position: 'absolute', bottom: 0, left: 0, right: 0, 
                                                            p: 4, background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
                                                            backdropFilter: 'blur(4px)'
                                                        }}>
                                                            <Chip 
                                                                label="Current Stay" 
                                                                size="small"
                                                                sx={{ mb: 1.5, bgcolor: '#10b981', color: '#fff', fontWeight: 800, borderRadius: 1.5, fontSize: '0.7rem' }} 
                                                            />
                                                            <Typography variant="h3" sx={{ fontWeight: 900, color: '#fff', mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                                                                {myBoarding?.boardingId?.title}
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'rgba(255,255,255,0.8)' }}>
                                                                <MapIcon sx={{ fontSize: 18 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 500 }}>{myBoarding?.boardingId?.address}</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                </Card>

                                                <Grid container spacing={3} sx={{ mb: 4 }}>
                                                    {[
                                                        { label: 'Monthly Rent', value: `LKR ${myBoarding?.boardingId?.pricePerMonth?.toLocaleString()}`, icon: <MoneyIcon />, color: '#4f46e5', bg: '#eef2ff' },
                                                        { label: 'Room Type', value: myBoarding?.boardingId?.roomType, icon: <RoomIcon />, color: '#8b5cf6', bg: '#f5f3ff' },
                                                        { label: 'Assigned On', value: new Date(myBoarding.startDate).toLocaleDateString(), icon: <CalendarIcon />, color: '#06b6d4', bg: '#ecfeff' }
                                                    ].map((stat, i) => (
                                                        <Grid item xs={12} sm={4} key={i}>
                                                            <Paper sx={{ p: 3, borderRadius: 5, border: '1px solid #f1f5f9', bgcolor: '#fff', height: '100%' }}>
                                                                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: stat.bg, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                                                                    {React.cloneElement(stat.icon, { fontSize: 'small' })}
                                                                </Box>
                                                                <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}>{stat.label}</Typography>
                                                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1e293b' }}>{stat.value}</Typography>
                                                            </Paper>
                                                        </Grid>
                                                    ))}
                                                </Grid>

                                                {/* Payment History Timeline */}
                                                <Paper sx={{ borderRadius: 6, border: '1px solid #f1f5f9', p: 4, bgcolor: '#fff' }}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1e293b', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                            <HistoryIcon className="text-indigo-500" /> Payment History
                                                        </Typography>
                                                        <Chip label={`${payments.length} Records`} size="small" sx={{ fontWeight: 700, bgcolor: '#f8fafc' }} />
                                                    </Box>

                                                    {payments.length > 0 ? (
                                                        <Box sx={{ position: 'relative', pl: 3, '&::before': { content: '""', position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, bgcolor: '#f1f5f9' } }}>
                                                            {payments.map((p, idx) => (
                                                                <Box key={p._id} sx={{ mb: 3, position: 'relative' }}>
                                                                    <Box sx={{ 
                                                                        position: 'absolute', left: -26, top: 4, width: 14, height: 14, 
                                                                        borderRadius: '50%', border: '3px solid #fff',
                                                                        bgcolor: p.status === 'Approved' ? '#10b981' : p.status === 'Rejected' ? '#ef4444' : '#f59e0b',
                                                                        zIndex: 1
                                                                    }} />
                                                                    <Box sx={{ 
                                                                        p: 2.5, borderRadius: 4, bgcolor: '#f8fafc', 
                                                                        border: '1px solid #f1f5f9', display: 'flex', 
                                                                        justifyContent: 'space-between', alignItems: 'center',
                                                                        transition: 'transform 0.2s', '&:hover': { transform: 'scale(1.01)', bgcolor: '#fff' }
                                                                    }}>
                                                                        <Box>
                                                                            <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#334155' }}>{p.month}</Typography>
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: '#6366f1' }}>LKR {p.amount.toLocaleString()}</Typography>
                                                                                {p.isRewardUsed && <Chip label="Reward ✨" size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 800, bgcolor: '#fffbeb', color: '#92400e' }} />}
                                                                            </Box>
                                                                        </Box>
                                                                        <Box sx={{ textAlign: 'right' }}>
                                                                            <Typography variant="caption" sx={{ display: 'block', color: '#94a3b8', fontWeight: 500, mb: 0.5 }}>{new Date(p.createdAt).toLocaleDateString()}</Typography>
                                                                            <Chip 
                                                                                label={p.status} 
                                                                                size="small" 
                                                                                color={p.status === 'Approved' ? 'success' : p.status === 'Rejected' ? 'error' : 'warning'}
                                                                                sx={{ fontWeight: 800, height: 22, fontSize: '0.6rem', textTransform: 'uppercase' }}
                                                                            />
                                                                        </Box>
                                                                    </Box>
                                                                </Box>
                                                            ))}
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ py: 6, textAlign: 'center', bgcolor: '#f8fafc', borderRadius: 4, border: '1px dashed #e2e8f0' }}>
                                                            <ReceiptIcon sx={{ fontSize: 40, color: '#cbd5e1', mb: 1, opacity: 0.5 }} />
                                                            <Typography variant="body2" sx={{ color: '#94a3b8', fontWeight: 500 }}>No payments recorded yet</Typography>
                                                        </Box>
                                                    )}
                                                </Paper>
                                            </Grid>

                                            {/* Right Column: Tracker & Owner */}
                                            <Grid item xs={12} md={5}>
                                                {/* Payment Tracker Card */}
                                                <Paper sx={{ 
                                                    borderRadius: 6, p: 4, mb: 4, position: 'relative', overflow: 'hidden',
                                                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                                                    color: '#fff', boxShadow: '0 20px 25px -5px rgba(79,70,229,0.25)'
                                                }}>
                                                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
                                                            <Box>
                                                                <Typography sx={{ fontSize: '0.7rem', fontWeight: 800, color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: 2, mb: 0.5 }}>Payment Status</Typography>
                                                                <Typography variant="h5" sx={{ fontWeight: 900 }}>Next Payment Due</Typography>
                                                            </Box>
                                                            <Box sx={{ p: 1, px: 2, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                <StarsIcon sx={{ color: '#fbbf24', fontSize: 18 }} />
                                                                <Typography sx={{ fontWeight: 800, fontSize: '0.9rem' }}>{profile?.loyaltyPoints || 0} Pts</Typography>
                                                            </Box>
                                                        </Box>

                                                        <Typography variant="h2" sx={{ fontWeight: 900, mb: 1, fontFamily: "'Outfit', sans-serif" }}>
                                                            {getNextPaymentDate(myBoarding.startDate)}
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)', mb: 4, fontWeight: 500 }}>
                                                            Monthly fee: LKR {myBoarding?.boardingId?.pricePerMonth?.toLocaleString()}
                                                        </Typography>

                                                        <Button 
                                                            variant="contained" 
                                                            fullWidth 
                                                            startIcon={<UploadIcon />}
                                                            onClick={() => {
                                                                const basePrice = myBoarding?.boardingId?.pricePerMonth || 0;
                                                                setPaymentData({ 
                                                                    ...paymentData, 
                                                                    amount: basePrice, 
                                                                    useReward: false, 
                                                                    pointsUsed: 0 
                                                                });
                                                                setShowPaymentModal(true);
                                                            }}
                                                            sx={{ 
                                                                bgcolor: '#fff', color: '#4f46e5', borderRadius: 4, py: 2, 
                                                                textTransform: 'none', fontWeight: 800, fontSize: '1rem',
                                                                '&:hover': { bgcolor: 'rgba(255,255,255,0.9)', transform: 'translateY(-2px)' },
                                                                transition: 'all 0.2s', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'
                                                            }}
                                                        >
                                                            Process Payment
                                                        </Button>
                                                    </Box>
                                                    {/* Decorative Circles */}
                                                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
                                                    <Box sx={{ position: 'absolute', bottom: -100, left: -20, width: 250, height: 250, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
                                                </Paper>

                                                {/* Property Manager Card */}
                                                <Paper sx={{ borderRadius: 6, border: '1px solid #f1f5f9', p: 4, bgcolor: '#fff' }}>
                                                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: 1.5, mb: 3 }}>Property Manager</Typography>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 4 }}>
                                                        <Avatar 
                                                            src={myBoarding?.ownerId?.facePhoto}
                                                            sx={{ width: 80, height: 80, bgcolor: '#eef2ff', color: '#4f46e5', boxSizing: 'content-box', border: '5px solid #f8fafc', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}
                                                        >
                                                            {myBoarding?.ownerId?.name?.[0] || 'O'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="h6" sx={{ fontWeight: 900, color: '#1e293b' }}>{myBoarding?.ownerId?.name || 'Assigned Host'}</Typography>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5, p: 0.5, px: 1, borderRadius: 1.5, bgcolor: '#f0f9ff', width: 'fit-content' }}>
                                                                <ManagerIcon sx={{ fontSize: 16, color: '#0369a1' }} />
                                                                <Typography variant="caption" sx={{ fontWeight: 700, color: '#0369a1' }}>Verified Owner</Typography>
                                                            </Box>
                                                        </Box>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                                        <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Email</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{myBoarding?.ownerId?.email}</Typography>
                                                        </Box>
                                                        <Box sx={{ p: 2, borderRadius: 4, bgcolor: '#f8fafc', border: '1px solid #f1f5f9' }}>
                                                            <Typography variant="caption" sx={{ color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>Phone</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#334155' }}>{myBoarding?.ownerId?.phoneNumber || '+94 XXX XXX XXX'}</Typography>
                                                        </Box>
                                                    </Box>
                                                </Paper>
                                            </Grid>
                                        </Grid>
                                    )}

                                    {/* Payment Slip Upload Modal */}
                                    <Modal open={showPaymentModal} onClose={() => setShowPaymentModal(false)}>
                                        <Box sx={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: { xs: '90%', sm: 450 },
                                            bgcolor: '#fff',
                                            borderRadius: 4,
                                            boxShadow: '0 24px 48px rgba(0,0,0,0.15)',
                                            p: 4
                                        }}>
                                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937', mb: 1 }}>Upload Payment Slip</Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280', mb: 4 }}>Submit your monthly bank slip for verification.</Typography>

                                            <form onSubmit={handleUploadSlip}>
                                                <Box className="space-y-4">
                                                    <TextField
                                                        fullWidth
                                                        label="Payment Month"
                                                        placeholder="e.g., March"
                                                        required
                                                        value={paymentData.month}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                                                            setPaymentData({ ...paymentData, month: val });
                                                        }}
                                                        variant="outlined"
                                                        InputProps={{ sx: { borderRadius: 3 } }}
                                                    />
                                                    <TextField
                                                        fullWidth
                                                        label="Amount (LKR)"
                                                        required
                                                        value={paymentData.amount}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setPaymentData({ ...paymentData, amount: val });
                                                        }}
                                                        variant="outlined"
                                                        InputProps={{ sx: { borderRadius: 3 } }}
                                                        helperText={paymentData.useReward ? `Discount LKR 1,200 applied!` : ""}
                                                    />

                                                    <Box sx={{ 
                                                        p: 2, 
                                                        bgcolor: (profile?.loyaltyPoints >= 12) ? '#fffbeb' : '#f9fafb', 
                                                        border: '1px solid',
                                                        borderColor: (profile?.loyaltyPoints >= 12) ? '#fef3c7' : '#e5e7eb',
                                                        borderRadius: 3,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'space-between',
                                                        opacity: (profile?.loyaltyPoints >= 12) ? 1 : 0.7
                                                    }}>
                                                        <Box>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                                                                <StarsIcon sx={{ color: (profile?.loyaltyPoints >= 12) ? '#f59e0b' : '#9ca3af', fontSize: 18 }} />
                                                                <Typography variant="body2" sx={{ fontWeight: 700, color: (profile?.loyaltyPoints >= 12) ? '#92400e' : '#6b7280' }}>
                                                                    Redeem 12 Points
                                                                </Typography>
                                                            </Box>
                                                            <Typography variant="caption" sx={{ color: (profile?.loyaltyPoints >= 12) ? '#b45309' : '#9ca3af', display: 'block' }}>
                                                                {profile?.loyaltyPoints >= 12 
                                                                    ? "Available! Save LKR 1,200 on this payment" 
                                                                    : `Need ${12 - (profile?.loyaltyPoints || 0)} more points to redeem`}
                                                            </Typography>
                                                        </Box>
                                                        <input 
                                                            type="checkbox" 
                                                            disabled={!profile || profile.loyaltyPoints < 12}
                                                            className="w-6 h-6 accent-amber-500 cursor-pointer disabled:cursor-not-allowed"
                                                            checked={paymentData.pointsUsed === 12}
                                                            onChange={(e) => {
                                                                const checked = e.target.checked;
                                                                const basePrice = myBoarding?.boardingId?.pricePerMonth || 0;
                                                                const pts = checked ? 12 : 0;
                                                                setPaymentData({ 
                                                                    ...paymentData, 
                                                                    pointsUsed: pts,
                                                                    amount: basePrice - (pts * 100)
                                                                });
                                                            }}
                                                        />
                                                    </Box>
                                                    
                                                    <Box>
                                                        <Typography sx={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', mb: 1 }}>Upload Slip Image</Typography>
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            required
                                                            onChange={(e) => setPaymentData({ ...paymentData, slip: e.target.files[0] })}
                                                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100"
                                                        />
                                                    </Box>
                                                    <Box sx={{ 
                                                        p: 2, 
                                                        bgcolor: '#f8fafc', 
                                                        borderRadius: 3, 
                                                        border: '1px solid #e2e8f0',
                                                        mt: 3
                                                    }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                            <Typography variant="body2" sx={{ color: '#64748b' }}>Original Fee:</Typography>
                                                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#1f2937' }}>LKR {(myBoarding?.boardingId?.pricePerMonth || 0).toLocaleString()}</Typography>
                                                        </Box>
                                                        {paymentData.pointsUsed > 0 && (
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                                <Typography variant="body2" sx={{ color: '#059669' }}>Loyalty Discount:</Typography>
                                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#059669' }}>- LKR {(paymentData.pointsUsed * 100).toLocaleString()}</Typography>
                                                            </Box>
                                                        )}
                                                        <Divider sx={{ my: 1.5 }} />
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1f2937' }}>Final Amount:</Typography>
                                                            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#4f46e5' }}>LKR {paymentData.amount.toLocaleString()}</Typography>
                                                        </Box>
                                                    </Box>
                                                    <Divider sx={{ my: 2 }} />

                                                    <Box sx={{ display: 'flex', gap: 2 }}>
                                                        <Button 
                                                            fullWidth 
                                                            onClick={() => setShowPaymentModal(false)}
                                                            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600, color: '#6b7280' }}
                                                        >
                                                            Cancel
                                                        </Button>
                                                        <Button 
                                                            type="submit" 
                                                            fullWidth 
                                                            disabled={uploading}
                                                            variant="contained" 
                                                            sx={{ bgcolor: '#4f46e5', borderRadius: 3, textTransform: 'none', fontWeight: 700, py: 1.2 }}
                                                        >
                                                            {uploading ? <CircularProgress size={24} color="inherit" /> : 'Submit Slip'}
                                                        </Button>
                                                    </Box>
                                                </Box>
                                            </form>
                                        </Box>
                                    </Modal>
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
                                                        bgcolor: '#eef2ff',
                                                        color: '#4f46e5',
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

                                                <Box sx={{ mt: 3, p: 2, bgcolor: '#fffbeb', borderRadius: 3, border: '1px solid #fef3c7' }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.5 }}>
                                                        <StarsIcon sx={{ color: '#f59e0b', fontSize: 20 }} />
                                                        <Typography variant="h6" sx={{ fontWeight: 800, color: '#1f2937' }}>{profile?.loyaltyPoints || 0}</Typography>
                                                    </Box>
                                                    <Typography variant="caption" sx={{ color: '#b45309', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Loyalty Points</Typography>
                                                </Box>
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
