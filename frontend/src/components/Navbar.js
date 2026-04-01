import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
    Apartment as ApartmentIcon, 
    Menu as MenuIcon, 
    Close as CloseIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    Dashboard as DashboardIcon,
    KeyboardArrowDown as ArrowDownIcon
} from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';
import authService from '../services/authService';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [user, setUser] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Check for user on mount and location changes
    useEffect(() => {
        const userData = authService.getCurrentUser();
        setUser(userData);
    }, [location]);

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setIsProfileOpen(false);
        setIsMenuOpen(false);
        navigate('/');
    };


    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4 relative">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 z-10">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow shadow-blue-500/20">
                            <ApartmentIcon sx={{ color: 'white', fontSize: 18 }} />
                        </div>
                        <span className="text-lg font-extrabold text-gray-900 tracking-tight tracking-[-0.02em]">EasyStay</span>
                    </Link>

                    {/* Desktop Nav Links — always visible, centered */}
                    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-semibold text-gray-500">
                        <Link to="/" className={`hover:text-blue-600 transition-colors ${location.pathname === '/' ? 'text-blue-600' : ''}`}>Home</Link>
                        <Link to="/boardinglist" className={`hover:text-blue-600 transition-colors ${location.pathname === '/boardinglist' ? 'text-blue-600' : ''}`}>Boarding</Link>
                        <Link to="/#student-life-quote" className="hover:text-blue-600 transition-colors">Student Life</Link>
                        <Link to="/#contact" className="hover:text-blue-600 transition-colors">Support</Link>
                    </nav>

                    {/* Auth / Profile Section */}
                    <div className="hidden md:flex items-center gap-3 ml-auto relative">
                        {!user ? (
                            <>
                                <Link
                                    to="/login"
                                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${location.pathname === '/login' ? 'text-blue-600 bg-blue-50' : 'text-gray-600 hover:text-blue-600'}`}
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/signup"
                                    className={`text-sm font-bold text-white px-5 py-2.5 rounded-lg shadow shadow-blue-500/20 transition-all ${location.pathname === '/signup' ? 'bg-blue-800' : 'bg-blue-600 hover:bg-blue-700'}`}
                                >
                                    Sign Up
                                </Link>
                            </>
                        ) : (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:border-blue-200 transition-all group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                        <PersonIcon sx={{ fontSize: 18 }} />
                                    </div>
                                    <div className="flex flex-col items-start leading-none">
                                        <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{user.user?.name?.split(' ')[0]}</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{user.user?.role}</span>
                                    </div>
                                    <ArrowDownIcon sx={{ fontSize: 16, color: '#94a3b8', transition: '0.2s', transform: isProfileOpen ? 'rotate(180deg)' : 'none' }} className="group-hover:text-blue-500" />
                                </button>

                                {/* Profile Dropdown */}
                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                            <motion.div
                                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                                transition={{ duration: 0.15, ease: "easeOut" }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-1.5"
                                            >
                                                <div className="px-4 py-3 border-b border-slate-50 mb-1">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Signed in as</p>
                                                    <p className="text-sm font-bold text-slate-900 truncate">{user.user?.email}</p>
                                                </div>
                                                
                                                <Link 
                                                    to="/dashboard"
                                                    onClick={() => setIsProfileOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl transition-all"
                                                >
                                                    <DashboardIcon sx={{ fontSize: 18 }} /> Dashboard
                                                </Link>
                                                
                                                <button 
                                                    onClick={handleLogout}
                                                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <LogoutIcon sx={{ fontSize: 18 }} /> Logout
                                                </button>
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* Mobile Hamburger */}
                    <button className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                    </button>
                </div>
            </header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                        className="fixed top-[61px] left-0 right-0 z-40 bg-white border-b border-gray-100 shadow-lg md:hidden"
                    >
                        <div className="flex flex-col px-6 py-5 gap-4 text-sm font-semibold text-gray-600">
                            {user && (
                                <div className="flex items-center gap-3 pb-4 mb-2 border-b border-slate-50">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                        <PersonIcon />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-slate-900">{user.user?.name}</p>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{user.user?.role}</p>
                                    </div>
                                </div>
                            )}
                            
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/boardinglist" onClick={() => setIsMenuOpen(false)}>Boarding</Link>
                            
                            {user ? (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-blue-600 font-bold">Dashboard</Link>
                                    <button onClick={handleLogout} className="text-left text-red-500 font-bold">Logout</button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-blue-600">Login</Link>
                                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-white bg-blue-600 text-center py-2.5 rounded-lg font-bold">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
