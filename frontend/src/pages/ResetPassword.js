import React, { useState } from 'react';
import {
    TextField,
    Box,
    Typography,
    InputAdornment,
    Alert,
    CircularProgress,
    IconButton,
} from '@mui/material';
import {
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    HomeWork,
    Email as EmailIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/authService';

const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f8fafc' },
};

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const emailFromState = location.state?.email || '';

    const [email, setEmail] = useState(emailFromState);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (newPassword !== confirmPassword) {
            return setError('Passwords do not match.');
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
        if (!passwordRegex.test(newPassword)) {
            return setError('Password must be at least 6 characters long, contain 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
        }

        setLoading(true);

        try {
            const data = await authService.resetPassword(email, otp, newPassword);
            if (data.success) {
                setSuccessMsg('Password reset successful! Redirecting to login...');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-grid opacity-40" />
            <div
                className="blob blob-1"
                style={{ opacity: 0.06, width: 400, height: 400, top: -100, left: -100, background: 'radial-gradient(circle, #93c5fd, #3b82f6)' }}
            />

            <div className="relative z-10 w-full max-w-md">
                <div className="flex items-center justify-center gap-2 mb-8" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    <HomeWork className="text-indigo-600" />
                    <span className="text-indigo-600 font-bold text-lg">EasyStay</span>
                </div>

                <div className="glass-card p-10 w-full">
                    <div className="mb-8 text-center">
                        <Typography variant="h4" className="font-extrabold text-gray-900 mt-1">
                            Reset Password
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mt-2">
                            Enter the code sent to your email and your new password.
                        </Typography>
                    </div>

                    {error && <Alert severity="error" className="mb-4" sx={{ borderRadius: '12px' }}>{error}</Alert>}
                    {successMsg && <Alert severity="success" className="mb-4" sx={{ borderRadius: '12px' }}>{successMsg}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">
                        <TextField
                            fullWidth
                            label="Email Address"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <EmailIcon sx={{ color: '#6366f1' }} fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField
                            fullWidth
                            label="6-Digit OTP"
                            variant="outlined"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            placeholder="000 000"
                            required
                            sx={{
                                ...inputSx,
                                '& .MuiOutlinedInput-input': {
                                    textAlign: 'center',
                                    fontSize: '1.2rem',
                                    letterSpacing: '4px',
                                    fontWeight: 'bold'
                                }
                            }}
                        />

                        <TextField
                            fullWidth
                            label="New Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#6366f1' }} fontSize="small" />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                            {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPassword ? 'text' : 'password'}
                            variant="outlined"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            sx={inputSx}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <LockIcon sx={{ color: '#6366f1' }} fontSize="small" />
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6 || !newPassword || !confirmPassword}
                            className="gradient-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-4"
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Reset Password'}
                        </button>

                        <div className="text-center mt-4">
                            <span
                                className="text-sm text-indigo-600 cursor-pointer hover:underline font-medium"
                                onClick={() => navigate('/login')}
                            >
                                ← Back to Login
                            </span>
                        </div>
                    </Box>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
