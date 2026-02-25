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
    Description as DocIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';

const Dashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const isAdmin = user?.role === 'Admin';

    useEffect(() => {
        if (isAdmin) {
            loadAdminData();
        } else {
            setLoading(false);
        }
    }, [isAdmin]);

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
                <div className="flex-1 px-4 space-y-2 mt-4">
                    <div className="flex items-center gap-3 p-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium">
                        <DashboardIcon fontSize="small" /> Dashboard
                    </div>
                    {isAdmin && (
                        <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                            <PeopleIcon fontSize="small" /> User Management
                        </div>
                    )}
                    <div className="flex items-center gap-3 p-3 text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors">
                        <PersonIcon fontSize="small" /> Profile
                    </div>
                </div>
                <div className="p-4 border-t border-gray-100">
                    <Button fullWidth startIcon={<LogoutIcon />} onClick={handleLogout} className="text-gray-600">
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
                        /* Student / Placeholder Dashboard Content */
                        <Grid container spacing={4}>
                            <Grid item xs={12}>
                                <Paper className="p-8 rounded-2xl border border-gray-100 shadow-sm bg-gradient-to-r from-indigo-600 to-indigo-800 text-white">
                                    <Typography variant="h4" className="font-bold mb-2">
                                        {user?.role} Dashboard
                                    </Typography>
                                    <Typography variant="body1" className="opacity-90">
                                        Manage your boarding activities effectively with our modern management system.
                                    </Typography>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={4}>
                                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                    <CardContent className="p-6">
                                        <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                            My Bookings
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-gray-800">0</Typography>
                                        <div className="mt-4 text-gray-400 text-sm font-medium">No active bookings found</div>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                    <CardContent className="p-6">
                                        <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                            Saved Places
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-gray-800">0</Typography>
                                        <div className="mt-4 text-gray-400 text-sm font-medium">Browse to find places</div>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <Card className="rounded-2xl border border-gray-100 shadow-sm">
                                    <CardContent className="p-6">
                                        <Typography color="textSecondary" gutterBottom className="text-xs font-bold uppercase tracking-wider">
                                            Messages
                                        </Typography>
                                        <Typography variant="h4" className="font-bold text-gray-800">0</Typography>
                                        <div className="mt-4 text-gray-400 text-sm font-medium">All caught up!</div>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
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
