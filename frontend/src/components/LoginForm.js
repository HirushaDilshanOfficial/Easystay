import React, { useState } from 'react';
import {
    TextField,
    Box,
    Typography,
    InputAdornment,
    IconButton,
    Alert,
    CircularProgress,
    Divider,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility,
    VisibilityOff,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await authService.login(email, password);
            if (data.success) navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-card p-10 w-full">
            {/* Header */}
            <div className="mb-8">
                <Typography variant="overline" className="text-blue-700 font-bold tracking-widest">
                    Welcome back
                </Typography>
                <Typography variant="h4" className="font-extrabold text-gray-900 mt-1">
                    Sign in to EasyStay
                </Typography>
                <Typography variant="body2" className="text-gray-500 mt-2">
                    Enter your credentials to access your dashboard
                </Typography>
            </div>

            {error && (
                <Alert
                    severity="error"
                    className="mb-6 rounded-xl text-sm"
                    sx={{ borderRadius: '12px' }}
                >
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-5">
                <TextField
                    fullWidth
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. john@example.com"
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <EmailIcon sx={{ color: '#1d4ed8' }} fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            backgroundColor: '#f8fafc',
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <LockIcon sx={{ color: '#1d4ed8' }} fontSize="small" />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <div className="flex justify-end">
                    <span
                        className="text-sm text-blue-700 cursor-pointer hover:underline font-medium"
                        onClick={() => navigate('/forgot-password')}
                    >
                        Forgot password?
                    </span>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed bg-blue-700 hover:bg-blue-800 shadow-lg transition-all"
                >
                    {loading ? (
                        <CircularProgress size={22} sx={{ color: 'white' }} />
                    ) : (
                        <>
                            Sign In <ArrowIcon fontSize="small" />
                        </>
                    )}
                </button>

                <Divider className="mt-4 mb-2">
                    <Typography variant="caption" className="text-gray-400 px-2">
                        OR
                    </Typography>
                </Divider>

                <Typography variant="body2" className="text-center text-gray-600">
                    Don't have an account?{' '}
                    <span
                        className="text-blue-700 font-bold cursor-pointer hover:underline"
                        onClick={() => navigate('/signup')}
                    >
                        Create one free →
                    </span>
                </Typography>
            </Box>
        </div>
    );
};

export default LoginForm;
