import React from 'react';
import LoginForm from '../components/LoginForm';
import { HomeWork } from '@mui/icons-material';

const Login = () => {
    return (
        <div className="min-h-screen flex">
            {/* LEFT PANEL - Hidden on mobile */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel-shimmer"
                style={{
                    background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 30%, #4c1d95 60%, #6d28d9 100%)'
                }}
            >
                {/* Animated blobs */}
                <div className="blob blob-1" style={{ opacity: 0.3 }} />
                <div className="blob blob-2" style={{ opacity: 0.2 }} />
                <div className="bg-grid absolute inset-0" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                            <HomeWork className="text-white" fontSize="small" />
                        </div>
                        <span className="text-white font-bold text-lg tracking-wide">EasyStay</span>
                    </div>

                    {/* Main text */}
                    <div>
                        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mb-8" />
                        <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
                            Find Your<br />
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: 'linear-gradient(90deg, #c4b5fd, #f9a8d4)' }}>
                                Perfect Stay
                            </span>
                        </h1>
                        <p className="text-purple-200 text-lg leading-relaxed max-w-sm">
                            Manage your boarding experience effortlessly — whether you're a student, owner, or admin.
                        </p>

                        {/* Stats row */}
                        <div className="flex gap-8 mt-12">
                            {[
                                { label: 'Active Boardings', value: '1,200+' },
                                { label: 'Happy Students', value: '8,500+' },
                                { label: 'Cities', value: '24' },
                            ].map((s) => (
                                <div key={s.label}>
                                    <p className="text-white font-bold text-2xl">{s.value}</p>
                                    <p className="text-purple-300 text-xs mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Testimonial card */}
                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10">
                        <p className="text-purple-100 text-sm italic leading-relaxed">
                            "EasyStay made finding accommodation so seamless. The platform is intuitive and the listings are always up to date."
                        </p>
                        <div className="flex items-center gap-3 mt-4">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-bold">A</div>
                            <div>
                                <p className="text-white text-sm font-semibold">Aisha Perera</p>
                                <p className="text-purple-300 text-xs">Student, University of Colombo</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-50 overflow-hidden p-6">
                {/* Subtle background */}
                <div className="absolute inset-0 bg-grid opacity-40" />
                <div className="blob blob-2" style={{ opacity: 0.08, width: 500, height: 500, bottom: -150, right: -150 }} />

                <div className="relative z-10 w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                        <HomeWork className="text-indigo-600" />
                        <span className="text-indigo-600 font-bold text-lg">EasyStay</span>
                    </div>

                    <LoginForm />
                </div>
            </div>
        </div>
    );
};

export default Login;
