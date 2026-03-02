import React, { useState } from 'react';
import {
    TextField,
    Box,
    Typography,
    InputAdornment,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Email as EmailIcon,
    ArrowForward as ArrowIcon,
    HomeWork,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f8fafc' },
};

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            const data = await authService.forgotPassword(email);
            if (data.success) {
                setSuccessMsg('Reset code sent to your email.');
                setTimeout(() => {
                    navigate('/reset-password', { state: { email } });
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to send reset code.');
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
                            Forgot Password?
                        </Typography>
                        <Typography variant="body2" className="text-gray-500 mt-2">
                            Enter your email address and we'll send you a 6-digit code to reset your password.
                        </Typography>
                    </div>

                    {error && <Alert severity="error" className="mb-4" sx={{ borderRadius: '12px' }}>{error}</Alert>}
                    {successMsg && <Alert severity="success" className="mb-4" sx={{ borderRadius: '12px' }}>{successMsg}</Alert>}

                    <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-6">
                        <TextField
                            fullWidth
                            label="Email Address"
                            name="email"
                            type="email"
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

                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="gradient-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : <>
                                Send Reset Code <ArrowIcon fontSize="small" />
                            </>}
                        </button>
                    </Box>

                    <Divider className="my-6">
                        <Typography variant="caption" className="text-gray-400 px-2">OR</Typography>
                    </Divider>

                    <Typography variant="body2" className="text-center text-gray-600">
                        <span
                            className="text-blue-600 font-bold cursor-pointer hover:underline"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </span>
                    </Typography>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
