import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Apartment as ApartmentIcon, Menu as MenuIcon, Close as CloseIcon } from '@mui/icons-material';
import { AnimatePresence, motion } from 'framer-motion';

export default function Navbar() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const isHome = location.pathname === '/';

    return (
        <>
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between gap-4 relative">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 shrink-0 z-10">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow shadow-blue-500/20">
                            <ApartmentIcon sx={{ color: 'white', fontSize: 18 }} />
                        </div>
                        <span className="text-lg font-extrabold text-gray-900 tracking-tight">EasyStay</span>
                    </Link>

                    {/* Desktop Nav Links — always visible, centered */}
                    <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6 text-sm font-semibold text-gray-500">
                        <Link to="/" className="hover:text-blue-600 transition-colors">Home</Link>
                        <Link to="/boardinglist" className="hover:text-blue-600 transition-colors">Boarding</Link>
                        <Link to="/#student-life-quote" className="hover:text-blue-600 transition-colors">Student Life</Link>
                        <Link to="/#contact" className="hover:text-blue-600 transition-colors">Support</Link>
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center gap-3 ml-auto">
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
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/boardinglist" onClick={() => setIsMenuOpen(false)}>Boarding</Link>
                            <Link to="/loyalty-demo" onClick={() => setIsMenuOpen(false)} className="text-purple-600 font-bold">Loyalty Demo</Link>
                            <Link to="/payment-demo" onClick={() => setIsMenuOpen(false)} className="text-green-600 font-bold">Payment Demo</Link>
                            <Link to="/#student-life-quote" onClick={() => setIsMenuOpen(false)}>Student Life</Link>
                            <Link to="/#contact" onClick={() => setIsMenuOpen(false)}>Support</Link>
                            <hr className="border-gray-100" />
                            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-blue-600">Login</Link>
                            <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="text-white bg-blue-600 text-center py-2.5 rounded-lg">Sign Up</Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
