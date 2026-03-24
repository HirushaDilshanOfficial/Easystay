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
    FolderOutlined as FolderIcon,
    EditOutlined as EditIcon,
    DeleteOutline as DeleteIcon,
    ReportProblemOutlined as WarningIcon,
    PictureAsPdf as PdfIcon,
    NoteAddOutlined as NewBoardIcon
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    XAxis, YAxis, Tooltip as RechartTooltip, ResponsiveContainer, CartesianGrid,
    BarChart, Bar, Cell
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import userService from '../services/userService';
import api from '../api';

const NAV_ITEMS = [
    { icon: DashboardIcon, label: 'Dashboard', id: 'dashboard' },
    { icon: PeopleIcon, label: 'Users', id: 'users' },
    { icon: HomeIcon, label: 'Boardings', id: 'boardings' },
    { icon: NewBoardIcon, label: 'New Boardings', id: 'newBoardings' },
    { icon: ApproveIcon, label: 'Approvals', id: 'approvals' },
];

const DUMMY_CHART_DATA = [
    { name: 'Jan', users: 4 }, { name: 'Feb', users: 7 },
    { name: 'Mar', users: 10 }, { name: 'Apr', users: 8 },
    { name: 'May', users: 15 }, { name: 'Jun', users: 12 },
    { name: 'Jul', users: 18 },
];

const getDocUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `http://localhost:5001/uploads/${path}`;
};


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


function StatCard({ label, value, icon: Icon, accent, delay = 0, darkMode }) {
    const count = useCountUp(value);
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.45, ease: 'easeOut' }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className="relative rounded-2xl overflow-hidden p-6 cursor-default"
            style={{
                background: darkMode ? 'rgba(255,255,255,0.04)' : '#ffffff',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e2e8f0',
                boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.24)' : '0 2px 12px rgba(0,0,0,0.06)',
            }}
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: darkMode ? '#94a3b8' : '#64748b' }}>{label}</p>
                    <p className="text-4xl font-black" style={{ background: accent, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        {value !== undefined ? count : <Skeleton width={48} sx={{ bgcolor: darkMode ? 'grey.800' : 'grey.200' }} />}
                    </p>
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: darkMode ? accent : `${accent.split(',')[1] || '#6366f1'}15`, border: darkMode ? 'none' : `1px solid ${accent.split(',')[1] || '#6366f1'}30`, boxShadow: darkMode ? `0 0 20px ${accent.split(',')[1] || '#6366f1'}44` : 'none' }}>
                    <Icon sx={{ fontSize: 24 }} style={{ color: darkMode ? '#fff' : accent.split(',')[1] || '#6366f1' }} />
                </div>
            </div>
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg w-fit" style={{ background: darkMode ? 'rgba(34,211,238,0.1)' : 'rgba(34,211,238,0.15)' }}>
                    <TrendIcon style={{ fontSize: 14, color: darkMode ? '#22d3ee' : '#0891b2' }} />
                    <span className="text-[10px] font-bold tracking-wide" style={{ color: darkMode ? '#22d3ee' : '#0891b2' }}>+12% THIS WEEK</span>
                </div>
                <span className="text-xs text-gray-400">Live data</span>
            </div>
        </motion.div >
    );
}


function SkeletonRow() {
    return (
        <tr>
            {[...Array(5)].map((_, i) => (
                <td key={i} className="px-5 py-4">
                    <Skeleton variant="text" sx={{ bgcolor: 'rgba(100,116,139,0.1)', borderRadius: 1 }} />
                </td>
            ))}
        </tr>
    );
}


function ChartTooltip({ active, payload, label, darkMode }) {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: darkMode ? 'rgba(15,18,26,0.8)' : 'rgba(255,255,255,0.8)',
            border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.05)',
            borderRadius: 16, padding: '12px 16px',
            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(12px)',
        }}>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: darkMode ? '#64748b' : '#94a3b8' }}>{label}</p>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg,#6366f1,#ec4899)' }} />
                <p className="text-sm font-black" style={{ color: darkMode ? '#f8fafc' : '#1e2937' }}>
                    {payload[0].value} <span className="text-[11px] font-medium opacity-60">registrations</span>
                </p>
            </div>
        </div>
    );
}


function UserDetailModal({ user: u, onClose, onStatusUpdate, darkMode }) {
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
                            <Avatar
                                src={u.facePhoto}
                                sx={{
                                    width: 44, height: 44, fontSize: 18, fontWeight: 800,
                                    background: 'linear-gradient(135deg,#6366f1,#06b6d4)'
                                }}
                            >{u.name[0]}</Avatar>
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
                        {u.role === 'BoardingOwner' && (
                            <>
                                <InfoRow icon={PhoneIcon} label="Phone Number" value={u.phoneNumber} color="#06b6d4" />
                                <InfoRow icon={LocationIcon} label="Address" value={u.address} color="#10b981" />
                            </>
                        )}
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
                                    <a href={getDocUrl(u.nicPhoto)} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03]"
                                        style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', textDecoration: 'none' }}>
                                        <NicIcon sx={{ fontSize: 28, color: '#818cf8' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#818cf8' }}>NIC Photo</span>
                                    </a>
                                )}
                                {u.facePhoto && (
                                    <a href={getDocUrl(u.facePhoto)} target="_blank" rel="noreferrer"
                                        className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:scale-[1.03]"
                                        style={{ background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', textDecoration: 'none' }}>
                                        <FacePhotoIcon sx={{ fontSize: 28, color: '#22d3ee' }} />
                                        <span className="text-xs font-semibold" style={{ color: '#22d3ee' }}>Face Photo</span>
                                    </a>
                                )}
                                {u.boardingDocuments?.map((doc, idx) => (
                                    <a key={idx} href={getDocUrl(doc)} target="_blank" rel="noreferrer"
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

                    {/* Pending Actions */}
                    {u.status === 'Pending' && (
                        <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-3" style={{ borderTop: `1px solid ${border}` }}>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => { onStatusUpdate(u, 'Active'); onClose(); }}
                                className="py-3 rounded-xl font-bold text-white shadow-lg transition-all flex items-center justify-center gap-2"
                                style={{ background: 'linear-gradient(135deg,#10b981,#34d399)' }}
                            >
                                <ApproveIcon sx={{ fontSize: 18 }} /> Approve Account
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => { onStatusUpdate(u, 'Rejected'); onClose(); }}
                                className="py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}
                            >
                                <RejectIcon sx={{ fontSize: 18 }} /> Reject Application
                            </motion.button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


function UserEditModal({ user: u, onClose, onSave, darkMode }) {
    const [formData, setFormData] = useState({
        name: u?.name || '',
        email: u?.email || '',
        phoneNumber: u?.phoneNumber || '',
        address: u?.address || '',
        role: u?.role || '',
        facePhoto: null
    });

    useEffect(() => {
        if (u) {
            setFormData({
                name: u.name,
                email: u.email,
                phoneNumber: u.phoneNumber || '',
                address: u.address || '',
                role: u.role || '',
                facePhoto: null
            });
        }
    }, [u]);

    if (!u) return null;

    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';
    const inputBg = darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';

    const handleSubmit = (e) => {
        e.preventDefault();

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('phoneNumber', formData.phoneNumber);
        data.append('address', formData.address);
        data.append('role', formData.role);

        if (formData.facePhoto) {
            data.append('facePhoto', formData.facePhoto);
        }

        onSave(u._id, data);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(30px)' }}
                >
                    <div className="px-6 py-5 border-b" style={{ borderColor: border }}>
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-black" style={{ color: text }}>Edit User</h2>
                            <IconButton size="small" onClick={onClose} sx={{ color: sub }}>
                                <CloseIcon />
                            </IconButton>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: sub }}>Full Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => {
                                    if (/^[a-zA-Z\s]*$/.test(e.target.value)) {
                                        setFormData({ ...formData, name: e.target.value });
                                    }
                                }}
                                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: sub }}>Email Address</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                                required
                            />
                        </div>
                        {u.role === 'BoardingOwner' && (
                            <>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: sub }}>Phone Number</label>
                                    <input
                                        type="text"
                                        value={formData.phoneNumber}
                                        onChange={(e) => {
                                            if (/^\d{0,10}$/.test(e.target.value)) {
                                                setFormData({ ...formData, phoneNumber: e.target.value });
                                            }
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                        style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: sub }}>Property Address</label>
                                    <textarea
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all min-h-[80px]"
                                        style={{ background: inputBg, border: `1px solid ${border}`, color: text }}
                                    />
                                </div>
                            </>
                        )}

                        {u.role === 'BoardingOwner' && (
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: sub }}>Update Face Photo</label>
                                <div className="flex items-center gap-4 p-3 rounded-xl" style={{ background: inputBg, border: `1px solid ${border}` }}>
                                    <Avatar src={formData.facePhoto ? URL.createObjectURL(formData.facePhoto) : u.facePhoto} sx={{ width: 44, height: 44 }} />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => setFormData({ ...formData, facePhoto: e.target.files[0] })}
                                        className="text-xs text-gray-500 file:mr-4 file:py-1.5 file:px-4 file:rounded-full file:border-0 file:text-[10px] file:font-black file:uppercase file:tracking-widest file:bg-indigo-50 file:text-indigo-600 hover:file:bg-indigo-100 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="pt-4">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                type="submit"
                                className="w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all"
                                style={{ background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}
                            >
                                Save Changes
                            </motion.button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


//  Approval Confirmation Modal

function ApproveConfirmationModal({ user: u, onClose, onConfirm, darkMode }) {
    if (!u) return null;
    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(40px)' }}
                >
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                            <ApproveIcon sx={{ fontSize: 40, color: '#10b981' }} />
                        </div>
                        <h2 className="text-xl font-black mb-2" style={{ color: text }}>Approve Account</h2>
                        <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: sub }}>
                            Are you sure you want to approve <span className="font-bold text-emerald-400">{u.name}</span>?
                            Their account will be activated immediately.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: text, border: `1px solid ${border}` }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onConfirm(u._id, 'Active')}
                                className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-500/20"
                                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                            >
                                Approve
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


function RejectReasonModal({ user: u, onClose, onConfirm, darkMode }) {
    const [reason, setReason] = useState('');
    if (!u) return null;

    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(40px)' }}
                >
                    <div className="p-8">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                            <RejectIcon sx={{ fontSize: 32, color: '#f87171' }} />
                        </div>
                        <h2 className="text-xl font-black mb-1" style={{ color: text }}>Reject Application</h2>
                        <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: sub }}>
                            Please provide a reason for rejecting <span className="font-bold text-red-400">{u.name}'s</span> application.
                        </p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: sub }}>Rejection Reason</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Documents are unclear or missing..."
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all duration-200 min-h-[120px] resize-none text-sm font-medium"
                                style={{
                                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    border: `1px solid ${border}`,
                                    color: text
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: text, border: `1px solid ${border}` }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                disabled={!reason.trim()}
                                onClick={() => onConfirm(u._id, 'Rejected', reason)}
                                className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)' }}
                            >
                                Confirm Rejection
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


function ApproveBoardingModal({ boarding: b, onClose, onConfirm, darkMode }) {
    const defaultMsg = b ? `Hello ${b.ownerName},\n\nGood news! Your boarding listing "${b.title}" has been approved by the admin and is now live on EasyStay.\n\nThank you for using our platform.` : '';
    const [message, setMessage] = useState('');
    
    useEffect(() => {
        if (b) setMessage(defaultMsg);
    }, [b]);

    if (!b) return null;
    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(40px)' }}
                >
                    <div className="p-8">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                            <ApproveIcon sx={{ fontSize: 32, color: '#10b981' }} />
                        </div>
                        <h2 className="text-xl font-black mb-1" style={{ color: text }}>Approve Boarding</h2>
                        <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: sub }}>
                            Customize the approval email sent to <span className="font-bold text-emerald-400">{b.ownerName}</span>.
                        </p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: sub }}>Email Message</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all duration-200 min-h-[140px] resize-none text-sm font-medium"
                                style={{
                                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    border: `1px solid ${border}`,
                                    color: text
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: text, border: `1px solid ${border}` }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onConfirm(b._id, message)}
                                className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-emerald-500/20 transition-all"
                                style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
                            >
                                Approve & Send
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function RejectBoardingModal({ boarding: b, onClose, onConfirm, darkMode }) {
    const [reason, setReason] = useState('');
    if (!b) return null;

    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(40px)' }}
                >
                    <div className="p-8">
                        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
                            <RejectIcon sx={{ fontSize: 32, color: '#f87171' }} />
                        </div>
                        <h2 className="text-xl font-black mb-1" style={{ color: text }}>Reject Boarding</h2>
                        <p className="text-sm font-medium mb-6 leading-relaxed" style={{ color: sub }}>
                            Please provide a reason for rejecting the boarding <span className="font-bold text-red-400">"{b.title}"</span>.
                        </p>

                        <div className="mb-8">
                            <label className="block text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: sub }}>Rejection Reason (Sent in Email)</label>
                            <textarea
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="e.g., Photos are blurry, price is unrealistic..."
                                className="w-full px-4 py-3 rounded-2xl outline-none transition-all duration-200 min-h-[120px] resize-none text-sm font-medium"
                                style={{
                                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                    border: `1px solid ${border}`,
                                    color: text
                                }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: text, border: `1px solid ${border}` }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                disabled={!reason.trim()}
                                onClick={() => onConfirm(b._id, reason)}
                                className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
                                style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)' }}
                            >
                                Reject & Send
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

function ActivityItem({ activity, cardBorder, textPrimary, textSecondary, darkMode }) {
    const isNew = (new Date() - new Date(activity.createdAt)) < 24 * 60 * 60 * 1000;

    const getActionText = (role) => {
        switch (role) {
            case 'Admin': return 'added a new administrator';
            case 'BoardingOwner': return 'registered as a boarding owner';
            case 'Student': return 'joined as a student';
            default: return 'joined the platform';
        }
    };

    return (
        <div className="flex items-start gap-4 px-5 py-4 transition-all cursor-default"
            style={{
                borderBottom: `1px solid ${cardBorder}`,
            }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.02)' : '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <div className="relative shrink-0">
                <Avatar sx={{
                    width: 38, height: 38, fontSize: 14, fontWeight: 700,
                    background: activity.role === 'Admin' ? 'linear-gradient(135deg,#f87171,#ef4444)' :
                        activity.role === 'Student' ? 'linear-gradient(135deg,#10b981,#34d399)' :
                            'linear-gradient(135deg,#6366f1,#818cf8)'
                }}>
                    {activity.name[0]}
                </Avatar>
                {isNew && (
                    <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2"
                        style={{ borderColor: darkMode ? '#0f121a' : '#ffffff' }} />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: textPrimary }}>
                    {activity.name}
                    <span className="font-normal ml-1" style={{ color: textSecondary, fontSize: 12 }}>{getActionText(activity.role)}</span>
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md"
                        style={{ background: darkMode ? 'rgba(255,255,255,0.06)' : '#f1f5f9', color: textSecondary }}>
                        {new Date(activity.createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                        style={{
                            background: activity.status === 'Active' ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                            color: activity.status === 'Active' ? '#10b981' : '#f59e0b'
                        }}>
                        {activity.status}
                    </span>
                </div>
            </div>
        </div>
    );
}


function DeleteConfirmationModal({ user: u, onClose, onConfirm, darkMode }) {
    if (!u) return null;

    const modalBg = darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)';
    const border = darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)';
    const text = darkMode ? '#f8fafc' : '#0f172a';
    const sub = darkMode ? '#94a3b8' : '#64748b';

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                    style={{ background: modalBg, border: `1px solid ${border}`, backdropFilter: 'blur(40px)' }}
                >
                    <div className="p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <WarningIcon sx={{ fontSize: 40, color: '#f87171' }} />
                        </div>
                        <h2 className="text-xl font-black mb-2" style={{ color: text }}>Confirm Deletion</h2>
                        <p className="text-sm font-medium mb-8 leading-relaxed" style={{ color: sub }}>
                            Are you sure you want to delete <span className="font-bold text-red-400">{u.name}</span>?
                            This action is permanent and cannot be undone.
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={onClose}
                                className="py-3 rounded-2xl font-bold text-sm transition-all"
                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: text, border: `1px solid ${border}` }}
                            >
                                Cancel
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onConfirm(u._id)}
                                className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-red-500/20"
                                style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)' }}
                            >
                                Delete User
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}


const AdminDashboard = () => {
    const navigate = useNavigate();
    const userData = authService.getCurrentUser();
    const { user } = userData || {};

    const [boardings, setBoardings] = useState([]);
    const [boardingSearchTerm, setBoardingSearchTerm] = useState('');
    const [boardingStatusFilter, setBoardingStatusFilter] = useState('All');
    const [boardingTypeFilter, setBoardingTypeFilter] = useState('All');
    const [selectedBoardingEdit, setSelectedBoardingEdit] = useState(null);
    const [boardingToDelete, setBoardingToDelete] = useState(null);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    // Force light mode on this specific deployment to break out of old cached dark mode state
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') return true;
        // if null or 'light', or to override old cache, we default to false (light mode)
        return false;
    });

    // Add an effect to ensure localStorage is synced with the intended default light mode if it was stuck
    useEffect(() => {
        if (!darkMode) {
            localStorage.setItem('theme', 'light');
        } else {
            localStorage.setItem('theme', 'dark');
        }
    }, [darkMode]);

    const [activeNav, setActiveNav] = useState('dashboard');
    const [snackbar, setSnackbar] = useState({ open: false, msg: '', severity: 'success' });
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedUserEdit, setSelectedUserEdit] = useState(null);
    const [userToDelete, setUserToDelete] = useState(null);
    const [userToApprove, setUserToApprove] = useState(null);
    const [userToReject, setUserToReject] = useState(null);
    const [boardingToApprove, setBoardingToApprove] = useState(null);
    const [boardingToReject, setBoardingToReject] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        loadAdminData();
        const timer = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    }, [darkMode]);

        // Filter users
    const filteredUsers = users.filter(u => {
        const matchesSearch = (u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesRole = roleFilter === 'All' || u.role === roleFilter;
        const matchesStatus = statusFilter === 'All' || u.status === statusFilter;
        return matchesSearch && matchesRole && matchesStatus;
    });

    // Filter boardings
    const filteredBoardings = boardings.filter(b => {
        const matchesSearch = (b.title?.toLowerCase().includes(boardingSearchTerm.toLowerCase()) ||
            b.address?.toLowerCase().includes(boardingSearchTerm.toLowerCase()) || 
            b.ownerName?.toLowerCase().includes(boardingSearchTerm.toLowerCase()));
        
        let matchesStatus = true;
        if (boardingStatusFilter === 'Active') matchesStatus = b.availability === true;
        if (boardingStatusFilter === 'Inactive') matchesStatus = b.availability === false;

        let matchesType = true;
        if (boardingTypeFilter !== 'All') matchesType = b.roomType === boardingTypeFilter;
        
        // Only show approved boardings in the main tab
        const isApproved = b.isApproved !== false; 
        
        return matchesSearch && matchesStatus && matchesType && isApproved;
    });

    const pendingBoardingsList = boardings.filter(b => b.isApproved === false);

    const loadAdminData = async () => {
        setLoading(true);
        try {
            const [s, u, bRes] = await Promise.all([
                userService.getStats(), 
                userService.getUsers(),
                api.get('/boardings?adminView=true') // adminView=true returns ALL boardings for admin
            ]);
            setStats(s.data);
            setUsers(u.data);
            setBoardings(bRes.data.data || []);
        } catch {
            setSnackbar({ open: true, msg: 'Failed to load data.', severity: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status, reason = null) => {
        try {
            await userService.updateUserStatus(id, status, reason);
            setSnackbar({
                open: true,
                msg: `User ${status === 'Active' ? 'approved' : 'rejected'} successfully.`,
                severity: status === 'Active' ? 'success' : 'warning'
            });
            setUserToApprove(null);
            setUserToReject(null);
            loadAdminData();
        } catch {
            setSnackbar({ open: true, msg: 'Failed to update status.', severity: 'error' });
        }
    };

    const handleTriggerApprove = (u) => setUserToApprove(u);
    const handleTriggerReject = (u) => setUserToReject(u);

    const handleExportPDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        // Brand Header
        doc.setFillColor(63, 81, 181);
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('EasyStay', 20, 22);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Boarding Management System | Admin Report', 20, 30);

        doc.setFontSize(8);
        doc.text('New Kandy Road, Malabe', 190, 18, { align: 'right' });
        doc.text('0772343423', 190, 24, { align: 'right' });
        doc.text('www.easystay.com', 190, 30, { align: 'right' });

        doc.setTextColor(33, 33, 33);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Registered Users Report', 20, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${timestamp}`, 20, 62);
        doc.text(`Total Users in this view: ${filteredUsers.length}`, 20, 67);

        const tableData = filteredUsers.map(u => [
            u.name,
            u.email,
            u.role,
            u.status,
            new Date(u.createdAt).toLocaleDateString()
        ]);

        autoTable(doc, {
            startY: 85,
            head: [['Name', 'Email', 'Role', 'Status', 'Joined Date']],
            body: tableData,
            headStyles: { fillColor: [63, 81, 181], textColor: [255, 255, 255], fontSize: 10, fontStyle: 'bold' },
            bodyStyles: { fontSize: 9, textColor: [51, 51, 51] },
            alternateRowStyles: { fillColor: [245, 245, 250] },
            margin: { left: 20, right: 20 }
        });

        doc.save(`EasyStay_Users_${new Date().getTime()}.pdf`);
        setSnackbar({ open: true, msg: 'PDF report generated!', severity: 'success' });
    };

    const handleExportBoardingsPDF = () => {
        const doc = new jsPDF();
        const timestamp = new Date().toLocaleString();

        doc.setFillColor(16, 185, 129); // Emerald color for boardings
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.setFont('helvetica', 'bold');
        doc.text('EasyStay', 20, 22);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('Boarding Management System | Admin Report', 20, 30);

        doc.setTextColor(33, 33, 33);
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text('Active Boardings Report', 20, 55);

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100, 100, 100);
        doc.text(`Generated on: ${timestamp}`, 20, 62);
        doc.text(`Total Boardings in this view: ${filteredBoardings.length}`, 20, 67);

        const tableData = filteredBoardings.map(b => [
            b.title,
            `${b.pricePerMonth} LKR`,
            b.address,
            b.ownerName,
            b.availability ? 'Active' : 'Inactive'
        ]);

        autoTable(doc, {
            startY: 85,
            head: [['Title', 'Price/Month', 'Location', 'Owner', 'Status']],
            body: tableData,
            headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontSize: 10 },
            bodyStyles: { fontSize: 9 },
            alternateRowStyles: { fillColor: [245, 250, 245] },
            margin: { left: 20, right: 20 }
        });

        doc.save(`EasyStay_Boardings_${new Date().getTime()}.pdf`);
        setSnackbar({ open: true, msg: 'Boardings PDF generated!', severity: 'success' });
    };

    const handleDeleteUser = async (id) => {
        try {
            await userService.deleteUser(id);
            setSnackbar({ open: true, msg: 'User deleted successfully.', severity: 'success' });
            setUserToDelete(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: err.response?.data?.error || 'Failed to delete user.', severity: 'error' });
        }
    };

    const handleUpdateUser = async (id, data) => {
        try {
            await userService.updateUser(id, data);
            setSnackbar({ open: true, msg: 'User details updated successfully.', severity: 'success' });
            setSelectedUserEdit(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: err.response?.data?.error || 'Failed to update user.', severity: 'error' });
        }
    };

    const handleDeleteBoarding = async () => {
        if (!boardingToDelete) return;
        try {
            await api.delete(`/boardings/delete/${boardingToDelete._id}`);
            setSnackbar({ open: true, msg: 'Boarding deleted successfully.', severity: 'success' });
            setBoardingToDelete(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: err.response?.data?.error || 'Failed to delete boarding.', severity: 'error' });
        }
    };

    const handleToggleBoardingStatus = async (boarding) => {
        try {
            const formData = new FormData();
            formData.append('availability', !boarding.availability);
            await api.put(`/boardings/update/${boarding._id}`, formData);
            setSnackbar({ open: true, msg: `Boarding marked as ${!boarding.availability ? 'Active' : 'Inactive'}.`, severity: 'success' });
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: 'Failed to update boarding status.', severity: 'error' });
        }
    };

    const handleSaveBoardingEdit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('title', selectedBoardingEdit.title);
            formData.append('pricePerMonth', selectedBoardingEdit.pricePerMonth);
            formData.append('address', selectedBoardingEdit.address);
            formData.append('description', selectedBoardingEdit.description || '');
            formData.append('roomType', selectedBoardingEdit.roomType || '');
            formData.append('genderType', selectedBoardingEdit.genderType || '');
            formData.append('contactNumber', selectedBoardingEdit.contactNumber || '');
            if (selectedBoardingEdit.distanceFromUniversity) {
                formData.append('distanceFromUniversity', selectedBoardingEdit.distanceFromUniversity);
            }
            
            await api.put(`/boardings/update/${selectedBoardingEdit._id}`, formData);
            setSnackbar({ open: true, msg: 'Boarding details updated successfully!', severity: 'success' });
            setSelectedBoardingEdit(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: 'Failed to update boarding.', severity: 'error' });
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleApproveBoardingWithMsg = async (id, message) => {
        try {
            await api.put(`/boardings/approve/${id}`, { message });
            setSnackbar({ open: true, msg: 'Boarding approved effectively.', severity: 'success' });
            setBoardingToApprove(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: 'Failed to approve boarding.', severity: 'error' });
        }
    };

    const handleRejectBoardingWithMsg = async (id, reason) => {
        try {
            await api.put(`/boardings/reject/${id}`, { reason });
            setSnackbar({ open: true, msg: 'Boarding rejected securely.', severity: 'success' });
            setBoardingToReject(null);
            loadAdminData();
        } catch (err) {
            setSnackbar({ open: true, msg: 'Failed to reject boarding.', severity: 'error' });
        }
    };

    const pendingOwners = users.filter(u => u.role === 'BoardingOwner' && u.status === 'Pending');
    const adminName = user?.name || user?.email?.split('@')[0] || 'Admin';

    // ─── Colors ─────────────────────────────
    const bg = darkMode ? '#0f121a' : '#f1f5f9';
    const cardBg = darkMode ? 'rgba(255,255,255,0.04)' : '#ffffff';
    const cardBorder = darkMode ? 'rgba(255,255,255,0.08)' : '#e2e8f0';
    const textPrimary = darkMode ? '#f8fafc' : '#1e293b';
    const textSecondary = darkMode ? '#94a3b8' : '#64748b';
    const sidebarBg = darkMode ? 'rgba(10,12,20,0.97)' : '#ffffff';

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
                        boxShadow: darkMode ? 'none' : '2px 0 16px rgba(0,0,0,0.06)',
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
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-lg"
                            style={{ background: 'linear-gradient(135deg, #2563eb, #60a5fa)' }}>
                            <HomeIcon style={{ color: '#fff', fontSize: 18 }} />
                        </div>
                        <AnimatePresence>
                            {sidebarOpen && (
                                <motion.span
                                    initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.2 }}
                                    className="font-black text-lg"
                                    style={{ background: 'linear-gradient(90deg, #2563eb, #60a5fa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
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
                                        background: isActive
                                            ? (darkMode ? 'linear-gradient(135deg, rgba(37,99,235,0.2), rgba(96,165,250,0.15))' : 'linear-gradient(135deg, #eff6ff, #dbeafe)')
                                            : 'transparent',
                                        border: isActive
                                            ? (darkMode ? '1px solid rgba(37,99,235,0.3)' : '1px solid #bfdbfe')
                                            : '1px solid transparent',
                                        color: isActive ? (darkMode ? '#60a5fa' : '#2563eb') : textSecondary,
                                        minWidth: 0,
                                    }}
                                >
                                    {isActive && (
                                        <motion.div layoutId="activeStrip"
                                            className="absolute left-0 top-2 bottom-2 w-1 rounded-full shadow-md"
                                            style={{ background: 'linear-gradient(180deg,#2563eb,#60a5fa)' }}
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
                                    {id === 'newBoardings' && pendingBoardingsList.length > 0 && (
                                        <span className="ml-auto bg-blue-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">
                                            {pendingBoardingsList.length}
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
                        background: darkMode ? 'rgba(15,18,26,0.9)' : '#ffffff',
                        backdropFilter: 'blur(20px)',
                        borderBottom: `1px solid ${cardBorder}`,
                        boxShadow: darkMode ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                    }}>
                    <div className="flex items-center gap-3">
                        <IconButton size="small" onClick={() => setSidebarOpen(p => !p)}
                            style={{ color: textSecondary }}>
                            {sidebarOpen ? <CollapseIcon fontSize="small" /> : <ExpandIcon fontSize="small" />}
                        </IconButton>
                        <div className="hidden sm:flex items-center gap-2 rounded-lg px-3 py-1.5"
                            style={{ background: darkMode ? 'rgba(255,255,255,0.04)' : '#f1f5f9', border: `1px solid ${cardBorder}` }}>
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
                <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto">

                    {activeNav === 'dashboard' && (
                        <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* Welcome Banner */}
                            <div className="relative overflow-hidden rounded-3xl p-8 shadow-lg border" style={{ borderColor: cardBorder, background: darkMode ? 'linear-gradient(135deg, #0f172a, #1e3a8a)' : 'linear-gradient(135deg, #2563eb, #3b82f6)' }}>
                                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
                                <div className="absolute bottom-0 left-20 w-32 h-32 bg-blue-300 opacity-20 rounded-full blur-2xl"></div>
                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 text-white">
                                    <div>
                                        <h1 className="text-3xl font-black mb-2 tracking-tight">
                                            Welcome back, <span className="text-blue-100">{adminName}</span> 👋
                                        </h1>
                                        <p className="text-blue-50 text-sm font-medium max-w-lg leading-relaxed">System overview and analytics at a glance. You have pending approvals requiring your attention today.</p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end bg-white/10 px-6 py-4 rounded-2xl backdrop-blur-sm border border-white/20">
                                        <p className="text-3xl font-black tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
                                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <p className="text-sm font-bold text-blue-100 mt-1 uppercase tracking-widest">
                                            {currentTime.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* STAT CARDS */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
                                <StatCard label="Total Users" value={stats?.totalUsers} icon={PeopleIcon}
                                    accent="linear-gradient(135deg,#2563eb,#60a5fa)" delay={0} darkMode={darkMode} />
                                <StatCard label="Pending Approvals" value={stats?.pendingOwners} icon={TimeIcon}
                                    accent="linear-gradient(135deg,#f59e0b,#fbbf24)" delay={0.08} darkMode={darkMode} />
                                <StatCard label="Active Owners" value={stats?.activeOwners} icon={HomeIcon}
                                    accent="linear-gradient(135deg,#0ea5e9,#38bdf8)" delay={0.16} darkMode={darkMode} />
                                <StatCard label="Students" value={stats?.totalStudents} icon={PersonIcon}
                                    accent="linear-gradient(135deg,#10b981,#34d399)" delay={0.24} darkMode={darkMode} />
                            </div>

                            {/* CHART */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.4 }}
                                className="rounded-[2rem] p-8 relative overflow-hidden"
                                style={{
                                    background: cardBg,
                                    border: `1px solid ${cardBorder}`,
                                    boxShadow: darkMode ? '0 20px 50px rgba(0,0,0,0.3)' : '0 10px 40px rgba(0,0,0,0.04)',
                                }}>

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10 relative z-10">
                                    <div>
                                        <h2 className="text-lg font-black tracking-tight" style={{ color: textPrimary }}>User Growth</h2>
                                        <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest mt-1">Monthly registrations overview</p>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-blue-500/5 border border-blue-500/10 hover:bg-blue-500/10 transition-colors">
                                            <p className="text-[10px] font-black text-blue-600 tracking-tighter flex items-center gap-1">
                                                <TrendIcon sx={{ fontSize: 12 }} /> +12.5%
                                            </p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase">Growth</p>
                                        </div>
                                        <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 hover:bg-indigo-500/10 transition-colors">
                                            <p className="text-[11px] font-black text-indigo-500">Feb</p>
                                            <p className="text-[9px] font-bold text-gray-500 uppercase">Current</p>
                                        </div>
                                        <div className="flex flex-col items-center px-4 py-2 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                                            <p className="text-[11px] font-black text-emerald-500">7 users</p>
                                            <p className="text-[9px] font-bold text-gray-400 uppercase">Joined</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="h-[280px] w-full relative z-10">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={stats?.growthData?.length > 0 ? stats.growthData : DUMMY_CHART_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                                            <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)'} />
                                            <XAxis
                                                dataKey="name"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: textSecondary, fontSize: 10, fontWeight: 800 }}
                                                dy={15}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{ fill: textSecondary, fontSize: 10, fontWeight: 800 }}
                                                ticks={[0, 2, 4, 6, 8]}
                                                domain={[0, 8]}
                                            />
                                            <RechartTooltip content={<ChartTooltip darkMode={darkMode} />} cursor={{ fill: 'transparent' }} />
                                            <Bar
                                                dataKey="users"
                                                radius={[6, 6, 0, 0]}
                                                barSize={32}
                                                animationDuration={1500}
                                            >
                                                {(stats?.growthData?.length > 0 ? stats.growthData : DUMMY_CHART_DATA).map((entry, index) => (
                                                    <Cell
                                                        key={`cell-${index}`}
                                                        fill={entry.name === 'Feb' ? '#2563eb' : (darkMode ? 'rgba(255,255,255,0.05)' : '#e2e8f0')}
                                                    />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </motion.div>

                            {/* RECENT ACTIVITY & UPDATES */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.4 }}
                                    className="lg:col-span-2 rounded-2xl overflow-hidden"
                                    style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                                    <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: cardBorder }}>
                                        <h2 className="text-base font-black px-2 py-1 rounded-md bg-white border border-gray-100 shadow-sm" style={{ color: textPrimary }}>Recent Activity</h2>
                                        <button className="text-[10px] font-black uppercase tracking-wider text-blue-600 hover:text-blue-500 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg">View All</button>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {stats?.recentActivity?.length > 0 ? (
                                            stats.recentActivity.map((activity, idx) => (
                                                <ActivityItem
                                                    key={activity._id}
                                                    activity={activity}
                                                    cardBorder={cardBorder}
                                                    textPrimary={textPrimary}
                                                    textSecondary={textSecondary}
                                                    darkMode={darkMode}
                                                />
                                            ))
                                        ) : (
                                            <div className="px-6 py-12 text-center text-xs text-gray-500">No recent activity found.</div>
                                        )}
                                    </div>
                                </motion.div>

                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.48, duration: 0.4 }}
                                    className="rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-4 shadow-sm"
                                    style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(96,165,250,0.1))', border: `1px solid ${cardBorder}` }}>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2 shadow-inner" style={{ background: 'rgba(37,99,235,0.1)' }}>
                                        <DocIcon sx={{ fontSize: 32, color: '#2563eb' }} />
                                    </div>
                                    <h3 className="text-base font-black" style={{ color: textPrimary }}>Quick Reports</h3>
                                    <p className="text-xs font-medium" style={{ color: textSecondary }}>Download your monthly system audit and user logs in PDF format.</p>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                        onClick={handleExportPDF}
                                        className="mt-2 px-8 py-3 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 transition-colors text-white shadow-lg shadow-blue-500/30">
                                        Generate Audit
                                    </motion.button>
                                </motion.div>
                            </div>
                            {/* PENDING APPROVALS */}
                            {pendingOwners.length > 0 && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.4 }}
                                    className="rounded-2xl overflow-hidden"
                                    style={{ background: cardBg, border: `1px solid rgba(245,158,11,0.25)`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(245,158,11,0.08)' }}>
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
                                                                <Avatar
                                                                    src={row.facePhoto}
                                                                    sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}
                                                                >
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
                                                                        <IconButton size="small" component="a" href={getDocUrl(row.nicPhoto)} target="_blank" sx={{ color: '#818cf8' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.facePhoto && (
                                                                    <Tooltip title="View Face Photo">
                                                                        <IconButton size="small" component="a" href={getDocUrl(row.facePhoto)} target="_blank" sx={{ color: '#22d3ee' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.boardingDocuments?.map((doc, idx) => (
                                                                    <Tooltip key={idx} title={`Boarding Doc ${idx + 1}`}>
                                                                        <IconButton size="small" component="a" href={getDocUrl(doc)} target="_blank" sx={{ color: '#fbbf24' }}>
                                                                            <DocIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                ))}
                                                                <Tooltip title="View All Details">
                                                                    <IconButton size="small" onClick={() => setSelectedUser(row)} sx={{ color: '#6366f1', background: 'rgba(99,102,241,0.08)', ml: 1 }}>
                                                                        <ExpandIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                {!row.nicPhoto && !row.facePhoto && !row.boardingDocuments?.length && (
                                                                    <span className="text-xs" style={{ color: textSecondary }}>No docs</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleTriggerApprove(row)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                                    <ApproveIcon sx={{ fontSize: 14 }} /> Approve
                                                                </motion.button>
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleTriggerReject(row)}
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
                                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 gap-4 border-b" style={{ borderColor: cardBorder }}>
                                    <h2 className="text-sm font-bold" style={{ color: textPrimary }}>All Users ({filteredUsers.length})</h2>

                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                        {/* Export PDF Button */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleExportPDF}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                                            style={{
                                                background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                                                color: '#fff',
                                                boxShadow: '0 4px 12px rgba(239, 68, 68, 0.2)'
                                            }}
                                        >
                                            <PdfIcon sx={{ fontSize: 16 }} /> Export PDF
                                        </motion.button>

                                        {/* Search Bar */}
                                        <div className="relative group flex-1 md:flex-none md:w-64">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-400 transition-colors" sx={{ fontSize: 18 }} />
                                            <input
                                                type="text"
                                                placeholder="Search name or email..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium outline-none transition-all"
                                                style={{
                                                    background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                    border: `1px solid ${cardBorder}`,
                                                    color: textPrimary
                                                }}
                                            />
                                        </div>

                                        {/* Role Filter */}
                                        <select
                                            value={roleFilter}
                                            onChange={(e) => setRoleFilter(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-all"
                                            style={{
                                                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                border: `1px solid ${cardBorder}`,
                                                color: textSecondary
                                            }}
                                        >
                                            <option value="All">All Roles</option>
                                            <option value="Admin">Admin</option>
                                            <option value="BoardingOwner">BoardingOwner</option>
                                            <option value="Student">Student</option>
                                        </select>

                                        {/* Status Filter */}
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-all"
                                            style={{
                                                background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                                border: `1px solid ${cardBorder}`,
                                                color: textSecondary
                                            }}
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Rejected">Rejected</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                                {['User', 'Role', 'Joined', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                                                        style={{ color: textSecondary }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                            ) : filteredUsers.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-5 py-12 text-center text-xs text-gray-400">
                                                        No users found matching your search/filters.
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredUsers.map((row, i) => (
                                                    <motion.tr key={row._id}
                                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-5 py-3.5">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    src={row.facePhoto}
                                                                    sx={{ width: 30, height: 30, fontSize: 11, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}
                                                                >
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
                                                                <Tooltip title="View Details">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => setSelectedUser(row)}
                                                                        sx={{ color: '#818cf8', background: 'rgba(99,102,241,0.08)', '&:hover': { background: 'rgba(99,102,241,0.15)' } }}
                                                                    >
                                                                        <ViewIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                <Tooltip title="Edit User">
                                                                    <IconButton
                                                                        size="small"
                                                                        onClick={() => setSelectedUserEdit(row)}
                                                                        sx={{ color: '#06b6d4', background: 'rgba(6,182,212,0.08)', '&:hover': { background: 'rgba(6,182,212,0.15)' } }}
                                                                    >
                                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>

                                                                {row.role !== 'Admin' && (
                                                                    <>
                                                                        <Tooltip title={row.status === 'Active' ? 'Deactivate' : 'Activate'}>
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => handleUpdateStatus(row._id, row.status === 'Active' ? 'Inactive' : 'Active')}
                                                                                sx={{
                                                                                    color: row.status === 'Active' ? '#94a3b8' : '#34d399',
                                                                                    background: row.status === 'Active' ? 'rgba(148,163,184,0.08)' : 'rgba(16,185,129,0.08)',
                                                                                    '&:hover': { background: row.status === 'Active' ? 'rgba(148,163,184,0.15)' : 'rgba(16,185,129,0.15)' }
                                                                                }}
                                                                            >
                                                                                {row.status === 'Active' ? <RejectIcon sx={{ fontSize: 16 }} /> : <ApproveIcon sx={{ fontSize: 16 }} />}
                                                                            </IconButton>
                                                                        </Tooltip>

                                                                        <Tooltip title="Delete User">
                                                                            <IconButton
                                                                                size="small"
                                                                                onClick={() => setUserToDelete(row)}
                                                                                sx={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', '&:hover': { background: 'rgba(239,68,68,0.15)' } }}
                                                                            >
                                                                                <DeleteIcon sx={{ fontSize: 16 }} />
                                                                            </IconButton>
                                                                        </Tooltip>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeNav === 'newBoardings' && (
                        <motion.div key="newBoardings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* Section Title */}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: textPrimary }}>New Boarding Approvals</h1>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>Review and manage pending new boarding listings.</p>
                            </div>

                            {/* PENDING BOARDINGS TABLE */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                                style={{ background: cardBg, border: `1px solid rgba(59,130,246,0.25)`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(59,130,246,0.08)' }}>
                                <div className="flex items-center justify-between px-6 py-4 border-b"
                                    style={{ borderColor: 'rgba(59,130,246,0.15)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                                        <h2 className="text-sm font-bold" style={{ color: textPrimary }}>Pending Boardings ({pendingBoardingsList.length})</h2>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                                {['Boarding Info', 'Location & Price', 'Owner Details', 'Documents', 'Actions'].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                                                        style={{ color: textSecondary }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {pendingBoardingsList.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-5 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                                                                <NewBoardIcon sx={{ fontSize: 32, color: textSecondary, opacity: 0.3 }} />
                                                            </div>
                                                            <p className="text-sm font-medium" style={{ color: textSecondary }}>No pending boardings to review.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingBoardingsList.map((b, i) => (
                                                    <motion.tr key={b._id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="group hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div>
                                                                <p className="text-sm font-semibold" style={{ color: textPrimary }}>{b.title}</p>
                                                                <p className="text-[11px] mt-0.5" style={{ color: textSecondary }}>{b.roomType} • {b.genderType}</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {b.address || '—'}
                                                            <div className="mt-1">
                                                                <span className="text-[11px] font-bold text-emerald-500">{b.pricePerMonth?.toLocaleString()} LKR/mo</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary }}>
                                                            {b.ownerName || '—'}
                                                            <p className="text-[10px] font-semibold">{b.contactNumber || '—'}</p>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-1">
                                                                {b.nicPhoto && (
                                                                    <Tooltip title="View NIC">
                                                                        <IconButton size="small" component="a" href={getDocUrl(b.nicPhoto)} target="_blank" sx={{ color: '#818cf8' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {b.depositSlip && (
                                                                    <Tooltip title="View Deposit Slip">
                                                                        <IconButton size="small" component="a" href={getDocUrl(b.depositSlip)} target="_blank" sx={{ color: '#fbbf24' }}>
                                                                            <DocIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {!b.nicPhoto && !b.depositSlip && (
                                                                    <span className="text-xs" style={{ color: textSecondary }}>No docs</span>
                                                                )}
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setBoardingToApprove(b)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                                    <ApproveIcon sx={{ fontSize: 14 }} /> Approve
                                                                </motion.button>
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => setBoardingToReject(b)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                                    <RejectIcon sx={{ fontSize: 14 }} /> Reject
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeNav === 'approvals' && (
                        <motion.div key="approvals" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* Section Title */}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Pending Approvals</h1>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>Review and manage pending boarding owner applications.</p>
                            </div>

                            {/* PENDING APPROVALS TABLE */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                                style={{ background: cardBg, border: `1px solid rgba(245,158,11,0.25)`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(245,158,11,0.08)' }}>
                                <div className="flex items-center justify-between px-6 py-4 border-b"
                                    style={{ borderColor: 'rgba(245,158,11,0.15)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                                        <h2 className="text-sm font-bold" style={{ color: textPrimary }}>Pending Applications ({pendingOwners.length})</h2>
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
                                            {pendingOwners.length === 0 ? (
                                                <tr>
                                                    <td colSpan="5" className="px-5 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                                                                <ApproveIcon sx={{ fontSize: 32, color: textSecondary, opacity: 0.3 }} />
                                                            </div>
                                                            <p className="text-sm font-medium" style={{ color: textSecondary }}>No pending applications found.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingOwners.map((row, i) => (
                                                    <motion.tr key={row._id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.06 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="group hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Avatar
                                                                    src={row.facePhoto}
                                                                    sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, background: 'linear-gradient(135deg,#6366f1,#06b6d4)' }}
                                                                >
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
                                                                        <IconButton size="small" component="a" href={getDocUrl(row.nicPhoto)} target="_blank" sx={{ color: '#818cf8' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.facePhoto && (
                                                                    <Tooltip title="View Face Photo">
                                                                        <IconButton size="small" component="a" href={getDocUrl(row.facePhoto)} target="_blank" sx={{ color: '#22d3ee' }}>
                                                                            <ViewIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                )}
                                                                {row.boardingDocuments?.map((doc, idx) => (
                                                                    <Tooltip key={idx} title={`Boarding Doc ${idx + 1}`}>
                                                                        <IconButton size="small" component="a" href={getDocUrl(doc)} target="_blank" sx={{ color: '#fbbf24' }}>
                                                                            <DocIcon sx={{ fontSize: 16 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                ))}
                                                                <Tooltip title="View All Details">
                                                                    <IconButton size="small" onClick={() => setSelectedUser(row)} sx={{ color: '#6366f1', background: 'rgba(99,102,241,0.08)', ml: 1 }}>
                                                                        <ExpandIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleTriggerApprove(row)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)' }}>
                                                                    <ApproveIcon sx={{ fontSize: 14 }} /> Approve
                                                                </motion.button>
                                                                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                                                    onClick={() => handleTriggerReject(row)}
                                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all"
                                                                    style={{ background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)' }}>
                                                                    <RejectIcon sx={{ fontSize: 14 }} /> Reject
                                                                </motion.button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {activeNav === 'boardings' && (
                        <motion.div key="boardings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">

                            {/* Section Title */}
                            <div>
                                <h1 className="text-2xl font-black" style={{ color: textPrimary }}>Active Boardings</h1>
                                <p className="text-sm mt-1" style={{ color: textSecondary }}>View all approved and active boardings in the system.</p>
                            </div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.4 }}
                                className="rounded-2xl overflow-hidden shadow-xl"
                                style={{ background: cardBg, border: `1px solid ${cardBorder}`, boxShadow: darkMode ? 'none' : '0 2px 12px rgba(0,0,0,0.06)' }}>
                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 py-6 border-b gap-4" style={{ borderColor: cardBorder }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <h2 className="text-sm font-bold" style={{ color: textPrimary }}>All Boardings ({filteredBoardings.length})</h2>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                                        {/* Export PDF */}
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={handleExportBoardingsPDF}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg"
                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', boxShadow: '0 4px 12px rgba(16,185,129,0.25)' }}
                                        >
                                            <PdfIcon sx={{ fontSize: 16 }} /> Export PDF
                                        </motion.button>
                                        {/* Search */}
                                        <div className="relative group flex-1 md:flex-none md:w-56">
                                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-400 transition-colors" sx={{ fontSize: 18 }} />
                                            <input
                                                type="text"
                                                placeholder="Search title, address, owner..."
                                                value={boardingSearchTerm}
                                                onChange={(e) => setBoardingSearchTerm(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2 rounded-xl text-xs font-medium outline-none transition-all"
                                                style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                            />
                                        </div>
                                        {/* Status Filter */}
                                        <select
                                            value={boardingStatusFilter}
                                            onChange={(e) => setBoardingStatusFilter(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-all"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, color: textSecondary }}
                                        >
                                            <option value="All">All Status</option>
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                        {/* Room Type Filter */}
                                        <select
                                            value={boardingTypeFilter}
                                            onChange={(e) => setBoardingTypeFilter(e.target.value)}
                                            className="px-3 py-2 rounded-xl text-xs font-bold outline-none cursor-pointer transition-all"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', border: `1px solid ${cardBorder}`, color: textSecondary }}
                                        >
                                            <option value="All">All Types</option>
                                            <option value="Single">Single</option>
                                            <option value="Shared">Shared</option>
                                            <option value="Annex">Annex</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                                {['Boarding Title', 'Location', 'Price (LKR)', 'Owner', 'Status', 'Actions'].map(h => (
                                                    <th key={h} className="px-5 py-3 text-left text-[10px] font-black uppercase tracking-widest"
                                                        style={{ color: textSecondary }}>{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
                                            ) : filteredBoardings.length === 0 ? (
                                                <tr>
                                                    <td colSpan="6" className="px-5 py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-16 h-16 rounded-full bg-white/[0.03] flex items-center justify-center">
                                                                <HomeIcon sx={{ fontSize: 32, color: textSecondary, opacity: 0.3 }} />
                                                            </div>
                                                            <p className="text-sm font-medium" style={{ color: textSecondary }}>No matching boardings found.</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : (
                                                filteredBoardings.map((b, i) => (
                                                    <motion.tr key={b._id}
                                                        initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                                                        style={{ borderBottom: `1px solid ${cardBorder}` }}
                                                        className="hover:bg-white/[0.02] transition-colors"
                                                    >
                                                        <td className="px-5 py-4">
                                                            <div>
                                                                <p className="text-sm font-semibold" style={{ color: textPrimary }}>{b.title}</p>
                                                                <p className="text-[11px] mt-0.5" style={{ color: textSecondary }}>{b.roomType} • {b.genderType} Students</p>
                                                            </div>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            {b.address || '—'}
                                                            <br /><span className="text-[10px] opacity-70">({b.distanceFromUniversity}km from SLIIT)</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <p className="text-sm font-black" style={{ color: '#10b981' }}>{b.pricePerMonth?.toLocaleString()}</p>
                                                        </td>
                                                        <td className="px-5 py-4 text-sm" style={{ color: textSecondary }}>
                                                            {b.ownerName || '—'}<br />
                                                            <span className="text-[10px] font-semibold">{b.contactNumber || '—'}</span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg"
                                                                style={{
                                                                    background: b.availability ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                                                                    color: b.availability ? '#34d399' : '#f87171'
                                                                }}>
                                                                {b.availability ? 'Active' : 'Inactive'}
                                                            </span>
                                                        </td>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-2">
                                                                <Tooltip title="Edit Boarding">
                                                                    <IconButton size="small" onClick={() => setSelectedBoardingEdit(b)} sx={{ color: '#06b6d4', background: 'rgba(6,182,212,0.08)', '&:hover': { background: 'rgba(6,182,212,0.15)' } }}>
                                                                        <EditIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title={b.availability ? "Set Inactive" : "Set Active"}>
                                                                    <IconButton size="small" onClick={() => handleToggleBoardingStatus(b)} sx={{ color: b.availability ? '#f59e0b' : '#10b981', background: b.availability ? 'rgba(245,158,11,0.08)' : 'rgba(16,185,129,0.08)', '&:hover': { background: b.availability ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.15)' } }}>
                                                                        {b.availability ? <WarningIcon sx={{ fontSize: 16 }} /> : <ApproveIcon sx={{ fontSize: 16 }} />}
                                                                    </IconButton>
                                                                </Tooltip>
                                                                <Tooltip title="Delete Boarding">
                                                                    <IconButton size="small" onClick={() => setBoardingToDelete(b)} sx={{ color: '#f87171', background: 'rgba(239,68,68,0.08)', '&:hover': { background: 'rgba(239,68,68,0.15)' } }}>
                                                                        <DeleteIcon sx={{ fontSize: 16 }} />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                </main>
            </div>

            {/* USER DETAIL MODAL */}
            <UserDetailModal
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
                onStatusUpdate={(u, s) => s === 'Active' ? handleTriggerApprove(u) : handleTriggerReject(u)}
                darkMode={darkMode}
            />

            {/* USER EDIT MODAL */}
            <UserEditModal
                user={selectedUserEdit}
                onClose={() => setSelectedUserEdit(null)}
                onSave={handleUpdateUser}
                darkMode={darkMode}
            />

            {/* DELETE CONFIRMATION MODAL */}
            <DeleteConfirmationModal
                user={userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDeleteUser}
                darkMode={darkMode}
            />

            {/* APPROVE CONFIRMATION MODAL */}
            <ApproveConfirmationModal
                user={userToApprove}
                onClose={() => setUserToApprove(null)}
                onConfirm={handleUpdateStatus}
                darkMode={darkMode}
            />

            {/* REJECT REASON MODAL */}
            <RejectReasonModal
                user={userToReject}
                onClose={() => setUserToReject(null)}
                onConfirm={handleUpdateStatus}
                darkMode={darkMode}
            />

            {/* APPROVE BOARDING MODAL */}
            <ApproveBoardingModal
                boarding={boardingToApprove}
                onClose={() => setBoardingToApprove(null)}
                onConfirm={handleApproveBoardingWithMsg}
                darkMode={darkMode}
            />

            {/* REJECT BOARDING MODAL */}
            <RejectBoardingModal
                boarding={boardingToReject}
                onClose={() => setBoardingToReject(null)}
                onConfirm={handleRejectBoardingWithMsg}
                darkMode={darkMode}
            />

            {/* DELETE BOARDING MODAL */}
            <AnimatePresence>
                {boardingToDelete && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
                        onClick={() => setBoardingToDelete(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl"
                            style={{ background: darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(40px)' }}
                        >
                            <div className="p-8 text-center">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                                    <WarningIcon sx={{ fontSize: 40, color: '#f87171' }} />
                                </div>
                                <h2 className="text-xl font-black mb-2" style={{ color: textPrimary }}>Delete Boarding</h2>
                                <p className="text-sm font-medium mb-2 leading-relaxed" style={{ color: textSecondary }}>Are you sure you want to delete</p>
                                <p className="text-base font-black mb-1" style={{ color: '#f87171' }}>"{boardingToDelete.title}"?</p>
                                <p className="text-xs mb-8" style={{ color: textSecondary }}>This action is permanent and cannot be undone.</p>
                                <div className="grid grid-cols-2 gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={() => setBoardingToDelete(null)}
                                        className="py-3 rounded-2xl font-bold text-sm transition-all"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: textPrimary, border: `1px solid ${cardBorder}` }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={handleDeleteBoarding}
                                        className="py-3 rounded-2xl font-bold text-sm text-white shadow-lg shadow-red-500/20"
                                        style={{ background: 'linear-gradient(135deg,#f87171,#ef4444)' }}
                                    >
                                        Delete Boarding
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* EDIT BOARDING MODAL */}
            <AnimatePresence>
                {selectedBoardingEdit && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
                        onClick={() => setSelectedBoardingEdit(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl"
                            style={{ background: darkMode ? 'rgba(15,18,26,0.98)' : 'rgba(255,255,255,0.98)', border: `1px solid ${cardBorder}`, backdropFilter: 'blur(30px)', maxHeight: '90vh', overflowY: 'auto' }}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(6,182,212,0.12)' }}>
                                        <EditIcon sx={{ fontSize: 18, color: '#06b6d4' }} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-black" style={{ color: textPrimary }}>Edit Boarding</h2>
                                        <p className="text-[10px]" style={{ color: textSecondary }}>Update boarding listing details</p>
                                    </div>
                                </div>
                                <IconButton size="small" onClick={() => setSelectedBoardingEdit(null)} sx={{ color: textSecondary }}>
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </div>
                            {/* Form */}
                            <form onSubmit={handleSaveBoardingEdit} className="p-6 space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Boarding Title</label>
                                    <input
                                        value={selectedBoardingEdit.title}
                                        onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, title: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Price / Month (LKR)</label>
                                        <input
                                            type="number"
                                            value={selectedBoardingEdit.pricePerMonth}
                                            onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, pricePerMonth: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Distance (km)</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={selectedBoardingEdit.distanceFromUniversity || ''}
                                            onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, distanceFromUniversity: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Room Type</label>
                                        <select
                                            value={selectedBoardingEdit.roomType || ''}
                                            onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, roomType: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                        >
                                            <option value="Single">Single</option>
                                            <option value="Shared">Shared</option>
                                            <option value="Annex">Annex</option>
                                        </select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Gender Type</label>
                                        <select
                                            value={selectedBoardingEdit.genderType || ''}
                                            onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, genderType: e.target.value})}
                                            className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none cursor-pointer"
                                            style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                        >
                                            <option value="Male">Male</option>
                                            <option value="Female">Female</option>
                                            <option value="Any">Any</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Location Address</label>
                                    <input
                                        value={selectedBoardingEdit.address}
                                        onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, address: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                        required
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Contact Number</label>
                                    <input
                                        value={selectedBoardingEdit.contactNumber || ''}
                                        onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, contactNumber: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest ml-1" style={{ color: textSecondary }}>Description</label>
                                    <textarea
                                        value={selectedBoardingEdit.description || ''}
                                        onChange={e => setSelectedBoardingEdit({...selectedBoardingEdit, description: e.target.value})}
                                        className="w-full px-4 py-2.5 rounded-xl text-sm font-medium outline-none transition-all min-h-[80px] resize-none"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', border: `1px solid ${cardBorder}`, color: textPrimary }}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={() => setSelectedBoardingEdit(null)}
                                        className="py-3 rounded-xl font-bold text-sm transition-all"
                                        style={{ background: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', color: textPrimary, border: `1px solid ${cardBorder}` }}
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        className="py-3 rounded-xl font-bold text-sm text-white shadow-lg"
                                        style={{ background: 'linear-gradient(135deg,#06b6d4,#0284c7)' }}
                                    >
                                        Save Changes
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
