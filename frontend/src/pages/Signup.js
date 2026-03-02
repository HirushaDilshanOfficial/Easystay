import React from 'react';
import SignupForm from '../components/SignupForm';
import { HomeWork, School, BusinessCenter, Security } from '@mui/icons-material';

const features = [
    {
        icon: <School fontSize="small" />,
        label: 'Student Access',
        desc: 'SLIIT students only — sign up with your @my.sliit.lk email.',
        color: 'bg-green-400/20 text-green-300',
    },
    {
        icon: <BusinessCenter fontSize="small" />,
        label: 'Boarding Owners',
        desc: 'List your property. Accounts reviewed by admin before activation.',
        color: 'bg-blue-400/20 text-blue-300',
    },
    {
        icon: <Security fontSize="small" />,
        label: 'Secure Platform',
        desc: 'All data protected with JWT authentication and bcrypt hashing.',
        color: 'bg-purple-400/20 text-purple-300',
    },
];

const Signup = () => (
    <div className="min-h-screen flex">
        {/* LEFT PANEL */}
        <div
            className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel-shimmer"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 40%, #1e40af 70%, #2563eb 100%)' }}
        >
            <div className="blob blob-1" style={{ opacity: 0.25, background: 'radial-gradient(circle, #60a5fa, #3b82f6)' }} />
            <div className="blob blob-2" style={{ opacity: 0.15, background: 'radial-gradient(circle, #818cf8, #6366f1)' }} />
            <div className="bg-grid absolute inset-0" />

            <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                        <HomeWork className="text-white" fontSize="small" />
                    </div>
                    <span className="text-white font-bold text-lg tracking-wide">EasyStay</span>
                </div>

                {/* Headline */}
                <div>
                    <div className="w-16 h-1 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full mb-8" />
                    <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
                        Join the<br />
                        <span
                            className="text-transparent bg-clip-text"
                            style={{ backgroundImage: 'linear-gradient(90deg, #93c5fd, #67e8f9)' }}
                        >
                            Community
                        </span>
                    </h1>
                    <p className="text-blue-200 text-lg leading-relaxed max-w-sm mb-10">
                        Sri Lanka's smartest boarding management platform — built for students, owners, and admins.
                    </p>

                    {/* Feature list */}
                    <div className="space-y-4">
                        {features.map((f) => (
                            <div key={f.label} className="flex items-start gap-4">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${f.color}`}>
                                    {f.icon}
                                </div>
                                <div>
                                    <p className="text-white font-semibold text-sm">{f.label}</p>
                                    <p className="text-blue-300 text-xs leading-relaxed">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="w-full lg:w-1/2 flex items-center justify-center relative bg-slate-50 overflow-hidden p-6">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div
                className="blob blob-1"
                style={{ opacity: 0.06, width: 400, height: 400, top: -100, left: -100, background: 'radial-gradient(circle, #93c5fd, #3b82f6)' }}
            />

            <div className="relative z-10 w-full max-w-md">
                {/* Mobile logo */}
                <div className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                    <HomeWork className="text-indigo-600" />
                    <span className="text-indigo-600 font-bold text-lg">EasyStay</span>
                </div>

                <SignupForm />
            </div>
        </div>
    </div>
);

export default Signup;
