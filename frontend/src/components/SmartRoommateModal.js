import React, { useState, useEffect } from 'react';
import { 
    X, 
    Zap, 
    Moon, 
    Sun, 
    Sparkles, 
    ShieldCheck, 
    User as UserIcon,
    Users,
    ChevronRight,
    Search,
    BookOpen,
    MessageCircle,
    Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import authService from '../services/authService';

const SmartRoommateModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('loading'); // loading, setup, matches (Community Board)
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        budget: 15000,
        sleepingHabit: 'Flexible',
        cleanliness: 'Average',
        studyPattern: 'Quiet Study',
        description: '',
        otherDetails: ''
    });
    const [matches, setMatches] = useState([]);
    const [saving, setSaving] = useState(false);
    const [hasProfile, setHasProfile] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            fetchInitialData();
        }
    }, [isOpen]);

    const fetchInitialData = async () => {
        try {
            setView('loading');
            // 1. Fetch current user's profile if logged in
            const currentUser = authService.getCurrentUser();
            if (currentUser) {
                try {
                    const profileRes = await api.get('/roommates/me');
                    if (profileRes.data.success) {
                        setProfile(profileRes.data.data);
                        setHasProfile(true);
                    }
                } catch (e) {
                    setHasProfile(false);
                }
            }
            
            // 2. Fetch community board (all profiles)
            await fetchBoard();
            setView('matches');
        } catch (err) {
            console.error(err);
            setView('matches'); // Fail gracefully and show the board
        }
    };

    const fetchBoard = async () => {
        const res = await api.get('/roommates/match');
        if (res.data.success) {
            setMatches(res.data.data);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/roommates', profile);
            setHasProfile(true);
            await fetchBoard();
            setView('matches');
        } catch (err) {
            console.error('Roommate save error details:', err);
            let msg = 'Unknown Error';
            if (err.response) {
                // The server responded with a status code that falls out of the range of 2xx
                msg = `Server Error [${err.response.status}]: ${err.response.data?.message || err.response.data?.error || 'No detail provided'}`;
            } else if (err.request) {
                // The request was made but no response was received
                msg = 'Network Error: The backend at http://localhost:5001 is not responding. Please ensure the backend server is running.';
            } else {
                // Something happened in setting up the request that triggered an Error
                msg = `Request Setup Error: ${err.message}`;
            }
            alert(msg);
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="bg-indigo-600 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl border border-white/10">
                            <Users className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Roommate Community Board</h2>
                            <p className="text-indigo-100 text-[10px] font-black uppercase tracking-widest opacity-80">Connected Students of SLIIT</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-white" size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                    {view === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                            <p className="text-slate-500 font-bold animate-pulse">Loading Community...</p>
                        </div>
                    )}

                    {view === 'setup' && (
                        <div className="max-w-2xl mx-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">My Community Listing</h3>
                                <button onClick={() => setView('matches')} className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Back to Board</button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Budget */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Monthly Budget Preference</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="5000" max="40000" step="1000"
                                                value={profile.budget}
                                                onChange={(e) => setProfile({...profile, budget: Number(e.target.value)})}
                                                className="flex-1 h-2 bg-slate-100 rounded-lg accent-indigo-600 cursor-pointer"
                                            />
                                            <span className="text-lg font-black text-slate-800 shrink-0">
                                                LKR {profile.budget.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Sleeping Habit */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Sleeping Habit</label>
                                        <div className="flex gap-2">
                                            {['Early Bird', 'Night Owl', 'Flexible'].map(h => (
                                                <button
                                                    key={h} type="button"
                                                    onClick={() => setProfile({...profile, sleepingHabit: h})}
                                                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${profile.sleepingHabit === h ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Cleanliness */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Cleanliness Level</label>
                                        <div className="flex gap-2">
                                            {['Very Clean', 'Average', 'Messy'].map(c => (
                                                <button
                                                    key={c} type="button"
                                                    onClick={() => setProfile({...profile, cleanliness: c})}
                                                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${profile.cleanliness === c ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Study Pattern */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Study Style</label>
                                        <div className="flex gap-2">
                                            {['Quiet Study', 'Group Study', 'Music OK'].map(s => (
                                                <button
                                                    key={s} type="button"
                                                    onClick={() => setProfile({...profile, studyPattern: s})}
                                                    className={`flex-1 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${profile.studyPattern === s ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Other Details */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Other Details & Requirements</label>
                                    <textarea 
                                        placeholder="Tell other students about yourself, preferred locations near SLIIT, or specific requirements..."
                                        value={profile.otherDetails}
                                        onChange={(e) => setProfile({...profile, otherDetails: e.target.value})}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-sm font-bold text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                        rows={4}
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        type="button" onClick={() => setView('matches')}
                                        className="px-8 py-3 outline-none text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-600 transition-all"
                                    >
                                        Discard
                                    </button>
                                    <button 
                                        disabled={saving || !user}
                                        className={`px-10 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-100 ${saving || !user ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'}`}
                                    >
                                        {saving ? 'Saving...' : (hasProfile ? 'Update Listing' : 'Post to Board')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'matches' && (
                        <div className="space-y-6">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Recent Listings</h3>
                                    <p className="text-slate-500 font-bold text-sm">Everyone on this board is a verified student looking for a shared stay.</p>
                                </div>
                                <button 
                                    onClick={() => {
                                        if (!user) {
                                            alert('Please log in as a student to post your profile.');
                                            return;
                                        }
                                        setView('setup');
                                    }}
                                    className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                                >
                                    <Plus size={16} /> {hasProfile ? 'Edit My Listing' : 'Add My profile'}
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                {matches.map((match, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        key={idx} 
                                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-indigo-100 transition-all group"
                                    >
                                        <div className={`p-6 flex-1 ${user?.user?._id === match.profile.user._id ? 'bg-indigo-50/30' : ''}`}>
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-sm ${user?.user?._id === match.profile?.user?._id ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white'}`}>
                                                        <UserIcon size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 leading-tight">
                                                            {user?.user?._id === match.profile?.user?._id ? 'You' : (match.profile?.user?.name || 'Student Listing')}
                                                        </h4>
                                                        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                                                            {user?.user?._id === match.profile?.user?._id ? 'Active Listing' : 'Verified Student'}
                                                        </p>
                                                    </div>
                                                </div>
                                                {match.matchPercentage > 0 && user?.user?._id !== match.profile?.user?._id && (
                                                    <div className="text-right">
                                                        <div className="text-lg font-black text-emerald-500 leading-none">{match.matchPercentage}%</div>
                                                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Match</div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-4">
                                                <div className="bg-slate-50 p-2 rounded-xl text-center">
                                                    <Sun size={12} className="text-slate-400 mx-auto mb-1" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{match.profile.sleepingHabit}</span>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-xl text-center">
                                                    <Sparkles size={12} className="text-slate-400 mx-auto mb-1" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight font-black">{match.profile.cleanliness}</span>
                                                </div>
                                                <div className="bg-slate-50 p-2 rounded-xl text-center">
                                                    <BookOpen size={12} className="text-slate-400 mx-auto mb-1" />
                                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-tight">{match.profile.studyPattern.split(' ')[0]}</span>
                                                </div>
                                            </div>

                                            {match.profile.otherDetails && (
                                                <div className="bg-indigo-50/50 p-3 rounded-xl mb-4 border border-indigo-100/50">
                                                    <p className="text-[11px] font-bold text-slate-700 italic leading-relaxed">
                                                        "{match.profile.otherDetails}"
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-800">LKR {match.profile?.budget?.toLocaleString() || '0'}/mo</span>
                                            {user?.user?._id === match.profile?.user?._id ? (
                                                <button 
                                                    onClick={() => setView('setup')}
                                                    className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all"
                                                >
                                                    Edit Details <ChevronRight size={14} />
                                                </button>
                                            ) : (
                                                <a 
                                                    href={`mailto:${match.profile?.user?.email || '#'}`}
                                                    className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all"
                                                >
                                                    Connect <MessageCircle size={14} className="fill-indigo-600 text-white" />
                                                </a>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {matches.length === 0 && (
                                <div className="text-center py-16 opacity-50">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Users size={32} />
                                    </div>
                                    <h4 className="text-slate-900 font-black uppercase tracking-widest">Board is empty</h4>
                                    <p className="text-slate-500 text-xs font-bold">Be the first to post your profile and find a roommate!</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SmartRoommateModal;
