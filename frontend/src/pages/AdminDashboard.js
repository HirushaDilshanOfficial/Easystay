import React, { useState, useEffect } from 'react';
import {
    Avatar, Badge, IconButton, InputBase,
    Skeleton, Snackbar, Alert, Tooltip
} from '@mui/material';
import {
    Dashboard as DashboardIcon,
    People as PeopleIcon,
    Home as HomeIcon,
    Logout as LogoutIcon,
    Search as SearchIcon,
    NotificationsOutlined as BellIcon,
    CheckCircleOutline as ApproveIcon,
    CancelOutlined as RejectIcon,
    Visibility as ViewIcon,
    Description as DocIcon,
    Refresh as RefreshIcon,
    MenuOpen as CollapseIcon,
    Menu as ExpandIcon,
    LightMode as LightIcon,
    DarkMode as DarkIcon,
    PersonOutline as PersonIcon,
    TrendingUp as TrendIcon,
    AccessTime as TimeIcon,
    Close as CloseIcon,
    EmailOutlined as EmailIcon,
    PhoneOutlined as PhoneIcon,
    LocationOnOutlined as LocationIcon,
    BadgeOutlined as NicIcon,
    FaceOutlined as FacePhotoIcon,
    FolderOutlined as FolderIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer, CartesianGrid
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';

// ─────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────
const NAV_ITEMS = [
    { icon: DashboardIcon, label: 'Dashboard', id: 'dashboard' },
    { icon: PeopleIcon, label: 'Users', id: 'users' },
    { icon: HomeIcon, label: 'Boardings', id: 'boardings' },
    { icon: ApproveIcon, label: 'Approvals', id: 'approvals' },
];

const DUMMY_CHART_DATA = [
    { name: 'Jan', users: 4 }, { name: 'Feb', users: 7 },
    { name: 'Mar', users: 10 }, { name: 'Apr', users: 8 },
    { name: 'May', users: 15 }, { name: 'Jun', users: 12 },
    { name: 'Jul', users: 18 },
];

// ─────────────────────────────────────────────
//  Counter animation hook
// ─────────────────────────────────────────────
function useCountUp(target, duration = 1200) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        if (target === undefined || target === null) return;
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(timer); }
            else setCount(Math.floor(start));
        }, 16);
        return () => clearInterval(timer);
    }, [target, duration]);
    return count;
}

// ─────────────────────────────────────────────
//  Stat Card
// ─────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, accent, delay = 0 }) {
    const count = useCountUp(value);
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative rounded-2xl overflow-hidden p-6 cursor-default"
            style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.24)',
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
                    <p className="text-4xl font-black" style={{ background: accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {value !== undefined ? count : <Skeleton width={48} sx={{ bgcolor: 'grey.800' }} />}
                    </p>
                </div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: accent, boxShadow: `0 0 20px ${accent.split(',')[1] || '#6366f1'}44` }}>
                    <Icon fontSize="small" style={{ color: '#fff' }} />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-1">
                <TrendIcon style={{ fontSize: 14, color: '#22d3ee' }} />
                <span className="text-xs text-gray-400">Live data</span>
            </div>
        </motion.div>
    );
}

// ─────────────────────────────────────────────
//  Loading Skeleton Row
// ─────────────────────────────────────────────
function SkeletonRow() {
    return (
        <tr>
            {[...Array(5)].map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <Skeleton variant="text" sx={{ bgcolor: 'rgba(255,255,255,0.06)', borderRadius: 1 }} />
                </td>
            ))}
        </tr>
    );
}

// ─────────────────────────────────────────────
//  Custom Chart Tooltip
// ─────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: 'rgba(15,18,26,0.92)', border: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(12px)', borderRadius: 12, padding: '10px 16px'
        }}>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-sm font-bold text-cyan-400">{payload[0].value} users</p>
        </div>
    );
}

// ─────────────────────────────────────────────
//  User Detail Modal
// ─────────────────────────────────────────────
function UserDetailModal({ user: u, onClose, darkMode }) {
    if (!u) return null;
    const modalBg = darkMode ? 'rgba(15,18,26,0.97)' : 'rgba(248,250,252,0.97)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    const InfoRow = ({ icon: Icon, label, value, color = '#818cf8' }) => (
        <div className="flex items-start gap-3 py-3" style={{ borderBottom: `1px solid ${border}` }}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${color}22` }}>
                <Icon sx={{ fontSize: 16, color }} />
            </div>
            <div>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: sub }}>{label}</p>
                <p className="text-sm font-semibold" style={{ color: text }}>{value || '—'}</p>
            </div>
        </div>
    );

    const isBoardingOwner = u.role === 'BoardingOwner';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.92, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.92, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-lg rounded-2xl overflow-hidden"
                    style={{
                        background: modalBg,
                        border: `1px solid ${border}`,
                        backdropFilter: 'blur(24px)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${border}` }}>
                        <div className="flex items-center gap-3">
                            <Avatar sx={{
                                width: 44, height: 44, fontSize: 18, fontWeight: 800,
                                background: 'linear-gradient(135deg,#6366f1,#06b6d4)'
                            }}>{u.name[0]}</Avatar>
                            <div>
                                <p className="font-black text-base" style={{ color: text }}>{u.name}</p>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg" style={{
                                    background: u.role === 'Admin' ? 'rgba(239,68,68,0.12)' : u.role === 'Student' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                                    color: u.role === 'Admin' ? '#f87171' : u.role === 'Student' ? '#34d399' : '#818cf8'
                                }}>{u.role}</span>
                            </div>
                        </div>
                        <IconButton size="small" onClick={onClose} sx={{ color: sub }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </div>

                    {/* Info */}
                    <div className="px-6 py-2">
                        <InfoRow icon={EmailIcon} label="Email" value={u.email} color="#6366f1" />
                        <InfoRow icon={PhoneIcon} label="Phone Number" value={u.phoneNumber} color="#06b6d4" />
                        <InfoRow icon={LocationIcon} label="Address" value={u.address} color="#10b981" />
                        <InfoRow icon={PersonIcon} label="Status" value={u.status} color={
                            u.status === 'Active' ? '#34d399' : u.status === 'Pending' ? '#fbbf24' : '#f87171'
                        } />
                        <InfoRow icon={TimeIcon} label="Joined" value={new Date(u.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} color="#94a3b8" />
                    </div>

                    {/* Documents — Boarding Owner only */}
                    {isBoardingOwner && (
                        <div className="px-6 pb-6">
                            <p className="text-[10px] font-black uppercase tracking-widest mt-4 mb-3" style={{ color: sub }}>Uploaded Documents</p>
                            <div className="grid grid-cols-2 gap-3">
                                {u.nicPhoto && (
                                    <a href={u.nicPhoto} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03]"
                                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none' }}>
                                        <NicIcon sx={{ fontSize: 28, color: '#818cf8' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>NIC Photo</span>
                                    </a>
                                )}
                                {u.facePhoto && (
                                    <a href={u.facePhoto} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03]"
                                        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', textDecoration: 'none' }}>
                                        <FacePhotoIcon sx={{ fontSize: 28, color: '#22d3ee' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#22d3ee' }}>Face Photo</span>
                                    </a>
                                )}
                                {u.boardingDocuments?.map((doc, idx) => (
                                    <a key={idx} href={doc} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03]"
                                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', textDecoration: 'none' }}>
                                        <FolderIcon sx={{ fontSize: 28, color: '#fbbf24' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Doc {idx + 1}</span>
                                    </a>
                                ))}
                                {!u.nicPhoto && !u.facePhoto && !u.boardingDocuments?.length && (
                                    <p className="col-span-2 text-xs text-center py-4" style={{ color: sub }}>No documents uploaded.</p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────
const AdminDashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};

    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') !== 'light');
    const [activeNav, setActiveNav] = useState('dashboard');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        loadAdminData();
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [s, u] = await Promise.all([userService.getStats(), userService.getUsers()]);
            setStats(s.data);
            setUsers(u.data);
        } catch {
            setSnackbar({ open: true, msg: 'Failed to load data.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await userService.updateUserStatus(id, status);
            setSnackbar({ open: true, msg: `User ${status === 'Active' ? 'approved' : 'rejected'} successfully.`, severity: status === 'Active' ? 'success' : 'warning' });
            loadAdminData();
        } catch {
            setSnackbar({ open: true, msg: 'Failed to update status.', severity: 'error' });
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const pendingOwners = users.filter(u => u.role === 'BoardingOwner' && u.status === 'Pending');
    const adminName = user?.name || user?.email?.split('@')[0] || 'Admin';

    // ─── Colors ─────────────────────────────
    const bg = darkMode ? '#0f121a' : '#f1f5f9';
    const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)';
    const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
    const textPrimary = darkMode ? '#f8fafc' : '#0f172a';
    const textSecondary = darkMode ? '#94a3b8' : '#64748b';
    const sidebarBg = darkMode ? 'rgba(10,12,20,0.95)' : 'rgba(255,255,255,0.9)';

    return (
        <div style={{ minHeight: '100vh', background: bg, color: textPrimary, fontFamily: 'Inter, system-ui, sans-serif', transition: 'all 0.3s' }}
            className="flex">

            {/* ── SIDEBAR ──────────────────────────────────── */}
            <AnimatePresence>
                <motion.aside
                    animate={{ width: sidebarOpen ? 272 : 80 }}
                    transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                    style={{
                        background: sidebarBg,
                        borderRight: `1px solid ${cardBorder}`,
                        backdropFilter: 'blur(24px)',
                        height: '100vh',
                        position: 'sticky',
                        top: 0,
                        overflow: 'hidden',
                        flexShrink: 0,
                        zIndex: 50
                    }}
                    className="flex flex-col"
                >
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-5 py-5 shrink-0">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}>
                            <HomeIcon style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                                    className="font-black text-lg"
                                    style={{ color: textPrimary }}
                                >EasyStay</motion.span>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 px-3 space-y-1 mt-2">
                        {NAV_ITEMS.map(({ icon: Icon, label, id }) => {
                            const isActive = activeNav === id;
                            return (
                                <motion.button
                                    key={id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveNav(id)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-left relative"
                                    style={{
                                        background: isActive ? 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(6,182,212,0.15))' : 'transparent',
                                        border: isActive ? '1px solid rgba(99,102,241,0.3)' : '1px solid transparent',
                                        color: isActive ? '#818cf8' : textSecondary,
                                        minWidth: 0,
                                    }}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeStrip"
                                            className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full"
                                            style={{ background: 'linear-gradient(180deg,#6366f1,#06b6d4)' }}
                                        />
                                    )}
                                    <Icon fontSize="small" className="shrink-0" />
                                    <AnimatePresence>
                                        {sidebarOpen && (
                                            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                                className="text-sm font-semibold whitespace-nowrap overflow-hidden">
                                                {label}
                                            </motion.span>
                                        )}
                                    </AnimatePresence>
                                    {id === 'approvals' && pendingOwners.length > 0 && (
                                        <span className="ml-auto bg-amber-500 text-black text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                            {pendingOwners.length}
                                        </span>
                                    )}
                                </motion.button>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t" style={{ borderColor: cardBorder }}>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                            style={{ color: '#f87171' }}
                        >
                            <LogoutIcon fontSize="small" />
                            {sidebarOpen && <span className="text-sm font-semibold">Logout</span>}
                        </motion.button>
                    </div>
                </motion.aside>
            </AnimatePresence>

            {/* ── MAIN ─────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* TOPBAR */}
                <header className="h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40"
                    style={{
                        background: darkMode ? 'rgba(15,18,26,0.8)' : 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: `1px solid ${cardBorder}`,
                    }}>
                    <div className="flex items-center gap-3">
                        <IconButton size="small" onClick={() => setSidebarOpen(p => !p)}
                            style={{ color: textSecondary }}>
                            {sidebarOpen ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                        </IconButton>
                        <div className="hidden sm:flex items-center gap-2 rounded-xl px-3 py-1.5"
                            style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
                            <SearchIcon style={{ fontSize: 15, color: textSecondary }} />
                            <InputBase placeholder="Quick search…" sx={{ fontSize: 13, color: textPrimary, width: 180 }} />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Dark mode toggle */}
                        <Tooltip title={darkMode ? 'Light mode' : 'Dark mode'}>
                            <IconButton size="small" onClick={() => setDarkMode(p => !p)} style={{ color: textSecondary }}>
                                {darkMode ? <LightIcon fontSize="small" /> : <DarkIcon fontSize="small" />}
                            </IconButton>
                        </Tooltip>

                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton size="small" style={{ color: textSecondary }}>
                                <Badge badgeContent={pendingOwners.length} color="error" max={9}>
                                    <BellIcon fontSize="small" />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Refresh */}
                        <Tooltip title="Refresh">
                            <IconButton size="small" onClick={loadAdminData} style={{ color: textSecondary }}>
                                <RefreshIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>

                        {/* Avatar */}
                        <div className="flex items-center gap-2">
                            <Avatar sx={{
                                width: 34, height: 34, fontSize: 13, fontWeight: 700,
                                background: 'linear-gradient(135deg,#6366f1,#06b6d4)'
                            }}>
                                {adminName[0]?.toUpperCase()}
                            </Avatar>
                            <div className="hidden md:block">
                                <p className="text-xs font-bold leading-none" style={{ color: textPrimary }}>{adminName}</p>
                                <p className="text-[10px] mt-0.5" style={{ color: textSecondary }}>Administrator</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* PAGE CONTENT */}
                <main className="flex-1 p-6 space-y-8 overflow-y-auto">

                    {activeNav === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-8">

                            {/* Welcome */}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: textPrimary }}>
                                    Welcome back, <span style={{ background: 'linear-gradient(90deg,#6366f1,#06b6d4)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{adminName}</span> 👋
                                </h1>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>Here's what's happening in your system today.</p>
                            </div>

                            {/* STAT CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                                <StatCard label="Total Users" value={stats?.totalUsers} icon={PeopleIcon}
                                    accent="linear-gradient(135deg,#6366f1,#818cf8)" delay={0} />
                                <StatCard label="Pending Approvals" value={stats?.pendingOwners} icon={TimeIcon}
                                    accent="linear-gradient(135deg,#f59e0b,#fbbf24)" delay={0.08} />
                                <StatCard label="Active Owners" value={stats?.activeOwners} icon={HomeIcon}
                                    accent="linear-gradient(135deg,#06b6d4,#22d3ee)" delay={0.16} />
                                <StatCard label="Students" value={stats?.totalStudents} icon={PersonIcon}
                                    accent="linear-gradient(135deg,#10b981,#34d399)" delay={0.24} />
                            </div>

                            {/* CHART */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                                className="rounded-2xl p-6"
                                style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(20px)' }}>
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h2 className="text-sm font-bold" style={{ color: textPrimary }}>User Growth</h2>
                                        <p className="text-xs mt-0.5" style={{ color: textSecondary }}>Monthly registrations overview</p>
                                    </div>
                                    <TrendIcon style={{ color: '#06b6d4', fontSize: 20 }} />
                                </div>
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={DUMMY_CHART_DATA}>
                                        <defs>
                                            <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                                        <XAxis dataKey="name" tick={{ fill: textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: textSecondary, fontSize: 11 }} axisLine={false} tickLine={false} width={25} />
                                        <RechartTooltip content={<ChartTooltip />} />
                                        <Area type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5}
                                            fill="url(#userGrad)" dot={{ fill: '#6366f1', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#818cf8' }} />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* PENDING APPROVALS */}
                            {pendingOwners.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
                                    className="rounded-2xl overflow-hidden"
                                    style={{ background: cardBg, border: `1px solid rgba(245,158,11,0.25)`, backdropFilter: 'blur(20px)' }}>
                                    <div className="flex items-center justify-between px-6 py-4 border-b"
                                        style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                            <h2 className="text-sm font-bold" style={{ color: textPrimary }}>Pending Approvals</h2>
                                            <span className="text-[10px] font-black bg-amber-500 text-black rounded-full px-2 py-0.5">{pendingOwners.length}</span>
                                        </div>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead>
                                                <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                                    {['Applicant', 'Contact', 'Address', 'Documents', 'Actions'].map(h => (
                                                        <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                                                            style={{ color: textSecondary }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingOwners.map((row, i) => (
                                                    <motion.tr key={row._id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="group hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                                                    {row.name[0]}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-semibold" style={{ color: textPrimary }}>{row.name}</p>
                                                                    <p className="text-[11px]" style={{ color: textSecondary }}>{row.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary }}>{row.phoneNumber || '—'}</td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.address || '—'}</td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-1">
                                                                {row.nicPhoto && (
                                                                    <Tooltip title="View NIC Photo">
                                                                        <IconButton size="small" component="a" href={row.nicPhoto} target="_blank" sx={{ color: '#818cf8' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.facePhoto && (
                                                                    <Tooltip title="View Face Photo">
                                                                        <IconButton size="small" component="a" href={row.facePhoto} target="_blank" sx={{ color: '#22d3ee' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.boardingDocuments?.map((doc, idx) => (
                                                                    <Tooltip key={idx} title={`Boarding Doc ${idx + 1}`}>
                                                                        <IconButton size="small" component="a" href={doc} target="_blank" sx={{ color: '#fbbf24' }}>
                                                                            <DocIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                ))}
                                                                {!row.nicPhoto && !row.facePhoto && !row.boardingDocuments?.length && (
                                                                    <span className="text-xs" style={{ color: textSecondary }}>No docs</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleUpdateStatus(row._id, 'Active')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                                    <ApproveIcon sx={{ fontSize: 14 }} /> Approve
                                                                </motion.button>
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleUpdateStatus(row._id, 'Rejected')}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                                    <RejectIcon sx={{ fontSize: 14 }} /> Reject
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {activeNav === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* Section Title */}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: textPrimary }}>User Management</h1>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>View, activate, deactivate, and inspect all registered users.</p>
                            </div>

                            {/* ALL USERS TABLE */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
                                className="rounded-2xl overflow-hidden"
                                style={{ background: cardBg, border: `1px solid ${cardBorder}`, backdropFilter: 'blur(20px)' }}>
                                <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: cardBorder }}>
                                    <h2 className="text-sm font-bold" style={{ color: textPrimary }}>All Users ({users.length})</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                                {['User', 'Role', 'Joined', 'Status', ''].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                                                        style={{ color: textSecondary }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading
                                                ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                                                : users.map((row, i) => (
                                                    <motion.tr key={row._id}
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}>
                                                                    {row.name[0]}
                                                                </Avatar>
                                                                <div>
                                                                    <p className="text-sm font-semibold leading-none" style={{ color: textPrimary }}>{row.name}</p>
                                                                    <p className="text-[11px] mt-0.5" style={{ color: textSecondary }}>{row.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                                                style={{
                                                                    background: row.role === 'Admin' ? 'rgba(239,68,68,0.12)' : row.role === 'Student' ? 'rgba(16,185,129,0.12)' : 'rgba(99,102,241,0.12)',
                                                                    color: row.role === 'Admin' ? '#f87171' : row.role === 'Student' ? '#34d399' : '#818cf8',
                                                                }}>{row.role}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5 text-sm" style={{ color: textSecondary }}>
                                                            {new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                                                                style={{
                                                                    background: row.status === 'Active' ? 'rgba(16,185,129,0.12)' : row.status === 'Pending' ? 'rgba(245,158,11,0.12)' : row.status === 'Inactive' ? 'rgba(148,163,184,0.12)' : 'rgba(239,68,68,0.12)',
                                                                    color: row.status === 'Active' ? '#34d399' : row.status === 'Pending' ? '#fbbf24' : row.status === 'Inactive' ? '#94a3b8' : '#f87171',
                                                                }}>{row.status}</span>
                                                        </td>
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button
                                                                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setSelectedUser(row)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}
                                                                >
                                                                    <ViewIcon sx={{ fontSize: 13 }} /> View
                                                                </motion.button>
                                                                {row.role !== 'Admin' && (
                                                                    <motion.button
                                                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                        onClick={() => handleUpdateStatus(row._id, row.status === 'Active' ? 'Inactive' : 'Active')}
                                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                        style={
                                                                            row.status === 'Active'
                                                                                ? { background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.25)' }
                                                                                : { background: 'rgba(16,185,129,0.12)', color: '#34d399', border: '1px solid rgba(16,185,129,0.25)' }
                                                                        }
                                                                    >
                                                                        {row.status === 'Active' ? 'Deactivate' : 'Activate'}
                                                                    </motion.button>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            }
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>

                    )}

                </main>
            </div>

            {/* USER DETAIL MODAL */}
            <UserDetailModal user={selectedUser} onClose={() => setSelectedUser(null)} darkMode={darkMode} />

            {/* SNACKBAR */}
            <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar(p => ({ ...p, open: false }))}
                    sx={{ borderRadius: 3, fontWeight: 600 }}>
                    {snackbar.msg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default AdminDashboard;
