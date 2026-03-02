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
    Person as PersonIcon,
    Phone as PhoneIcon,
    Home as HomeIcon,
    Visibility,
    VisibilityOff,
    ArrowForward as ArrowIcon,
    School as SchoolIcon,
    BusinessCenter as OwnerIcon,
    CheckCircle as CheckIcon,
    CloudUpload as UploadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

const ROLES = [
    {
        id: 'Student',
        label: 'Student',
        icon: <SchoolIcon />,
        description: 'Looking for boarding near SLIIT',
        color: 'from-green-500 to-emerald-600',
        lightColor: 'bg-green-50 border-green-200',
        selectedColor: 'bg-green-600',
    },
    {
        id: 'BoardingOwner',
        label: 'Boarding Owner',
        icon: <OwnerIcon />,
        description: 'List and manage your property',
        color: 'from-blue-500 to-indigo-600',
        lightColor: 'bg-blue-50 border-blue-200',
        selectedColor: 'bg-blue-600',
    },
];

const inputSx = {
    '& .MuiOutlinedInput-root': { borderRadius: '12px', backgroundColor: '#f8fafc' },
};

const FileUploadField = ({ label, name, required, multiple, onChange, files }) => {
    const hasFiles = files && files.length > 0;
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label} {required && <span className="text-red-500">*</span>}</label>
            <label
                htmlFor={name}
                className={`flex items-center gap-3 p-3 border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${hasFiles ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-indigo-300 hover:bg-indigo-50/50'}`}
            >
                {hasFiles ? (
                    <CheckIcon className="text-indigo-500" fontSize="small" />
                ) : (
                    <UploadIcon className="text-gray-400" fontSize="small" />
                )}
                <span className={`text-sm ${hasFiles ? 'text-indigo-700 font-medium' : 'text-gray-500'}`}>
                    {hasFiles
                        ? multiple
                            ? `${files.length} file(s) selected`
                            : files[0].name
                        : `Click to upload ${label.toLowerCase()}`}
                </span>
                <input
                    id={name}
                    name={name}
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    multiple={multiple}
                    className="hidden"
                    onChange={onChange}
                />
            </label>
        </div>
    );
};

const SignupForm = () => {
    const [step, setStep] = useState(1); // 1 = role picker, 2 = form
    const [selectedRole, setSelectedRole] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phoneNumber: '',
        address: '',
    });

    const [uploadedFiles, setUploadedFiles] = useState({
        nicPhoto: null,
        facePhoto: null,
        boardingDocuments: null,
    });

    const [otp, setOtp] = useState('');
    const [resendLoading, setResendLoading] = useState(false);

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setUploadedFiles((prev) => ({
            ...prev,
            [name]: name === 'boardingDocuments' ? Array.from(files) : [files[0]],
        }));
    };

    const handleRoleSelect = (role) => {
        setSelectedRole(role);
        setStep(2);
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');

        if (formData.password !== formData.confirmPassword) {
            return setError('Passwords do not match.');
        }

        setLoading(true);
        try {
            const payload = { ...formData, role: selectedRole };

            if (selectedRole === 'BoardingOwner') {
                payload.nicPhoto = uploadedFiles.nicPhoto?.[0] || null;
                payload.facePhoto = uploadedFiles.facePhoto?.[0] || null;
                payload.boardingDocuments = uploadedFiles.boardingDocuments || [];
            }

            const data = await authService.signup(payload, selectedRole);

            if (data.success) {
                if (selectedRole === 'Student') {
                    setStep(3); // OTP Verification Step
                    setSuccessMsg('A verification code has been sent to your email.');
                } else if (data.user?.status === 'Pending') {
                    setSuccessMsg('Registration submitted! Your account is pending admin approval.');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Signup failed. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await authService.verifyOTP(formData.email, otp);
            if (data.success) {
                setSuccessMsg('Email verified successfully! Redirecting...');
                setTimeout(() => {
                    navigate('/dashboard');
                }, 2000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Verification failed. Please check the code.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setError('');
        setResendLoading(true);
        try {
            const data = await authService.resendOTP(formData.email);
            if (data.success) {
                setSuccessMsg('A new verification code has been sent.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to resend OTP.');
        } finally {
            setResendLoading(false);
        }
    };

    // ─── STEP 1: Role Picker ─────────────────────────────────────────────────
    if (step === 1) {
        return (
            <div className="glass-card p-10 w-full">
                <div className="mb-8 text-center">
                    <Typography variant="overline" className="text-blue-500 font-semibold tracking-widest">
                        Get started
                    </Typography>
                    <Typography variant="h4" className="font-extrabold text-gray-900 mt-1">
                        Create your account
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-2">
                        Who are you? Select your role to continue.
                    </Typography>
                </div>

                <div className="space-y-4">
                    {ROLES.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleRoleSelect(role.id)}
                            className="w-full group"
                        >
                            <div className={`flex items-center gap-4 p-5 border-2 rounded-2xl text-left transition-all
                hover:scale-[1.01] hover:shadow-lg hover:border-indigo-300 hover:bg-indigo-50/50 border-gray-200 bg-white`}
                            >
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${role.color} shadow-md`}>
                                    {role.icon}
                                </div>
                                <div className="flex-1">
                                    <p className="font-bold text-gray-800 text-base">{role.label}</p>
                                    <p className="text-sm text-gray-500 mt-0.5">{role.description}</p>
                                </div>
                                <ArrowIcon className="text-gray-300 group-hover:text-indigo-400 transition-colors" fontSize="small" />
                            </div>
                        </button>
                    ))}
                </div>

                <Divider className="my-6">
                    <Typography variant="caption" className="text-gray-400 px-2">ALREADY HAVE AN ACCOUNT</Typography>
                </Divider>

                <Typography variant="body2" className="text-center text-gray-600">
                    <span
                        className="text-blue-600 font-bold cursor-pointer hover:underline"
                        onClick={() => navigate('/login')}
                    >
                        Sign in to your account →
                    </span>
                </Typography>
            </div>
        );
    }

    // ─── STEP 3: OTP Verification ───────────────────────────────────────────
    if (step === 3) {
        return (
            <div className="glass-card p-10 w-full">
                <div className="mb-6 text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                        <EmailIcon fontSize="large" />
                    </div>
                    <Typography variant="h5" className="font-extrabold text-gray-900">
                        Verify your email
                    </Typography>
                    <Typography variant="body2" className="text-gray-500 mt-2">
                        We've sent a 6-digit code to <span className="font-semibold text-gray-800">{formData.email}</span>.
                    </Typography>
                </div>

                {error && <Alert severity="error" className="mb-4" sx={{ borderRadius: '12px' }}>{error}</Alert>}
                {successMsg && <Alert severity="success" className="mb-4" sx={{ borderRadius: '12px' }}>{successMsg}</Alert>}

                <Box component="form" onSubmit={handleVerifyOtp} className="space-y-6">
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
                                fontSize: '1.5rem',
                                letterSpacing: '8px',
                                fontWeight: 'bold'
                            }
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading || otp.length !== 6}
                        className="gradient-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : 'Verify & Continue'}
                    </button>

                    <div className="text-center">
                        <Typography variant="body2" className="text-gray-500">
                            Didn't receive the code?{' '}
                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={resendLoading}
                                className="text-blue-600 font-bold hover:underline disabled:opacity-50"
                            >
                                {resendLoading ? 'Resending...' : 'Resend OTP'}
                            </button>
                        </Typography>
                    </div>
                </Box>
            </div>
        );
    }

    // ─── STEP 2: Role-Specific Form ──────────────────────────────────────────
    const roleInfo = ROLES.find((r) => r.id === selectedRole);

    return (
        <div className="glass-card p-10 w-full max-h-[90vh] overflow-y-auto">
            {/* Back button + Header */}
            <div className="mb-6">
                <button
                    onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
                    className="text-sm text-gray-400 hover:text-gray-700 transition-colors flex items-center gap-1 mb-4"
                >
                    ← Back
                </button>

                <div className="flex items-center gap-3 mb-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-white bg-gradient-to-br ${roleInfo.color}`}>
                        {roleInfo.icon}
                    </div>
                    <div>
                        <Typography variant="overline" className="text-blue-500 font-semibold tracking-widest leading-none">
                            {roleInfo.label}
                        </Typography>
                        <Typography variant="h5" className="font-extrabold text-gray-900 leading-tight">
                            Create Account
                        </Typography>
                    </div>
                </div>

                {selectedRole === 'Student' && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
                        <SchoolIcon fontSize="inherit" className="mt-0.5 flex-shrink-0" />
                        Only SLIIT emails are accepted (e.g., IT23678734@my.sliit.lk)
                    </div>
                )}
                {selectedRole === 'BoardingOwner' && (
                    <div className="mt-3 flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
                        <OwnerIcon fontSize="inherit" className="mt-0.5 flex-shrink-0" />
                        Your account will be reviewed by an admin before activation.
                    </div>
                )}
            </div>

            {error && <Alert severity="error" className="mb-4" sx={{ borderRadius: '12px' }}>{error}</Alert>}
            {successMsg && <Alert severity="success" className="mb-4" sx={{ borderRadius: '12px' }}>{successMsg}</Alert>}

            {!successMsg && (
                <Box component="form" onSubmit={handleSubmit} noValidate className="space-y-4">
                    {/* Common Fields */}
                    <TextField
                        fullWidth label="Full Name" name="name" variant="outlined"
                        value={formData.name} onChange={handleChange} required sx={inputSx}
                        InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment> }}
                    />
                    <TextField
                        fullWidth
                        label={selectedRole === 'Student' ? 'SLIIT Email (e.g. IT23678734@my.sliit.lk)' : 'Email Address'}
                        name="email" type="email" variant="outlined"
                        value={formData.email} onChange={handleChange} required sx={inputSx}
                        InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment> }}
                    />

                    {/* BoardingOwner Extra Fields */}
                    {selectedRole === 'BoardingOwner' && (
                        <>
                            <TextField
                                fullWidth label="Phone Number" name="phoneNumber" variant="outlined"
                                placeholder="0771234567"
                                value={formData.phoneNumber} onChange={handleChange} required sx={inputSx}
                                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment> }}
                            />
                            <TextField
                                fullWidth label="Property Address" name="address" variant="outlined"
                                value={formData.address} onChange={handleChange} required sx={inputSx} multiline rows={2}
                                InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment> }}
                            />
                            <div className="space-y-3">
                                <FileUploadField label="NIC Photo" name="nicPhoto" required onChange={handleFileChange} files={uploadedFiles.nicPhoto} />
                                <FileUploadField label="Face Photo" name="facePhoto" required onChange={handleFileChange} files={uploadedFiles.facePhoto} />
                                <FileUploadField label="Boarding Documents" name="boardingDocuments" required multiple onChange={handleFileChange} files={uploadedFiles.boardingDocuments} />
                            </div>
                        </>
                    )}

                    <TextField
                        fullWidth label="Password" name="password" type={showPassword ? 'text' : 'password'}
                        variant="outlined" value={formData.password} onChange={handleChange} required sx={inputSx}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment>,
                        }}
                    />
                    <TextField
                        fullWidth label="Confirm Password" name="confirmPassword" type={showPassword ? 'text' : 'password'}
                        variant="outlined" value={formData.confirmPassword} onChange={handleChange} required sx={inputSx}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><LockIcon sx={{ color: '#6366f1' }} fontSize="small" /></InputAdornment>,
                            endAdornment: <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                                </IconButton>
                            </InputAdornment>
                        }}
                    />

                    <button
                        type="submit"
                        disabled={loading}
                        className="gradient-btn w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading ? <CircularProgress size={22} sx={{ color: 'white' }} /> : <>
                            {selectedRole === 'BoardingOwner' ? 'Submit Application' : 'Create Account'} <ArrowIcon fontSize="small" />
                        </>}
                    </button>
                </Box>
            )}
        </div>
    );
};

export default SignupForm;
