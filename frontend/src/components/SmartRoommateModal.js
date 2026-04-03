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
    BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api';
import authService from '../services/authService';

const SmartRoommateModal = ({ isOpen, onClose }) => {
    const [view, setView] = useState('loading'); // loading, setup, matches
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState({
        budget: 15000,
        sleepingHabit: 'Flexible',
        cleanliness: 'Average',
        studyPattern: 'Quiet Study',
        smokingPreference: 'Non-Smoker',
        gender: 'Any',
        description: ''
    });
    const [matches, setMatches] = useState([]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const currentUser = authService.getCurrentUser();
            setUser(currentUser);
            if (!currentUser) {
                setView('setup'); // Will prompt login or just show the form for planning
                return;
            }
            fetchProfile();
        }
    }, [isOpen]);

    const fetchProfile = async () => {
        try {
            setView('loading');
            const res = await api.get('/roommates/me');
            if (res.data.success) {
                setProfile(res.data.data);
                fetchMatches();
            }
        } catch (err) {
            setView('setup');
        }
    };

    const fetchMatches = async () => {
        try {
            const res = await api.get('/roommates/match');
            if (res.data.success) {
                setMatches(res.data.data);
                setView('matches');
            }
        } catch (err) {
            console.error(err);
            setView('setup');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('/roommates', profile);
            fetchMatches();
        } catch (err) {
            alert(err.response?.data?.message || 'Error saving profile');
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
                <div className="bg-blue-600 p-6 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Zap className="text-white fill-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white uppercase tracking-tight">Smart Roommate Matching</h2>
                            <p className="text-blue-100 text-xs font-bold uppercase tracking-widest opacity-80">Find your tribe at SLIIT</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <X className="text-white" size={24} />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                    {view === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-slate-500 font-bold animate-pulse">Calculating Compatibility...</p>
                        </div>
                    )}

                    {view === 'setup' && (
                        <div className="max-w-2xl mx-auto">
                            {!user && (
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-8 flex items-start gap-4">
                                    <ShieldCheck className="text-blue-600 shrink-0 mt-1" size={24} />
                                    <div>
                                        <h4 className="text-blue-900 font-bold text-sm">Student identity Required</h4>
                                        <p className="text-blue-700 text-xs mt-1">Please log in with your SLIIT student credentials to save your profile and see matches. You can still fill the form below to see how it works!</p>
                                    </div>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Budget */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Monthly Budget (LKR)</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="5000" max="40000" step="1000"
                                                value={profile.budget}
                                                onChange={(e) => setProfile({...profile, budget: Number(e.target.value)})}
                                                className="flex-1 h-2 bg-slate-100 rounded-lg accent-blue-600 cursor-pointer"
                                            />
                                            <span className="text-lg font-black text-slate-800 shrink-0">
                                                {profile.budget.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Gender Preference */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Roommate Gender</label>
                                        <div className="flex gap-2">
                                            {['Male', 'Female', 'Any'].map(g => (
                                                <button
                                                    key={g} type="button"
                                                    onClick={() => setProfile({...profile, gender: g})}
                                                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${profile.gender === g ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-blue-200'}`}
                                                >
                                                    {g}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Sleeping Habit */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Sleeping Habit</label>
                                        <div className="space-y-2">
                                            {['Early Bird', 'Night Owl', 'Flexible'].map(h => (
                                                <button
                                                    key={h} type="button"
                                                    onClick={() => setProfile({...profile, sleepingHabit: h})}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.sleepingHabit === h ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {h === 'Early Bird' && <Sun size={14} />}
                                                    {h === 'Night Owl' && <Moon size={14} />}
                                                    {h === 'Flexible' && <Sparkles size={14} />}
                                                    {h}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Cleanliness */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Cleanliness</label>
                                        <div className="space-y-2">
                                            {['Very Clean', 'Average', 'Messy'].map(c => (
                                                <button
                                                    key={c} type="button"
                                                    onClick={() => setProfile({...profile, cleanliness: c})}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.cleanliness === c ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {c}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Study Pattern */}
                                    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Study Pattern</label>
                                        <div className="space-y-2">
                                            {['Quiet Study', 'Group Study', 'Music OK'].map(s => (
                                                <button
                                                    key={s} type="button"
                                                    onClick={() => setProfile({...profile, studyPattern: s})}
                                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${profile.studyPattern === s ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Smoking */}
                                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">Smoking Preference</label>
                                    <div className="flex gap-4">
                                        {['Non-Smoker', 'Smoker', 'No Preference'].map(sm => (
                                            <button
                                                key={sm} type="button"
                                                onClick={() => setProfile({...profile, smokingPreference: sm})}
                                                className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${profile.smokingPreference === sm ? 'bg-slate-900 border-slate-900 text-white' : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200'}`}
                                            >
                                                {sm}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button 
                                        type="button" onClick={onClose}
                                        className="px-8 py-4 text-slate-400 text-sm font-black uppercase tracking-widest hover:text-slate-600 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={saving || !user}
                                        className={`px-10 py-4 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-200 ${saving || !user ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' : 'bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-1'}`}
                                    >
                                        {saving ? 'Saving...' : 'Find Matches'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {view === 'matches' && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-end mb-4">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Your Smart Matches</h3>
                                    <p className="text-slate-500 font-bold text-sm">We found {matches.length} roommates matching your preferences perfectly.</p>
                                </div>
                                <button 
                                    onClick={() => setView('setup')}
                                    className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                                >
                                    Edit Preferences
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-8">
                                {matches.map((match, idx) => (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.1 }}
                                        key={idx} 
                                        className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col hover:shadow-xl hover:border-blue-100 transition-all group"
                                    >
                                        <div className="p-6 flex-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                        <UserIcon size={28} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-black text-slate-900 leading-tight">{match.profile.user.name}</h4>
                                                        <div className="flex gap-2 mt-1">
                                                            <span className="bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md">
                                                                {match.profile.gender === 'Any' ? 'Male/Female' : match.profile.gender}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-blue-600 leading-none">{match.matchPercentage}%</div>
                                                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Match</div>
                                                </div>
                                            </div>

                                            <div className="space-y-3 mb-6">
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Sun size={14} className="text-slate-400 shrink-0" />
                                                    <span className="text-xs font-bold">{match.profile.sleepingHabit}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <BookOpen size={14} className="text-slate-400 shrink-0" />
                                                    <span className="text-xs font-bold">{match.profile.studyPattern}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <Sparkles size={14} className="text-slate-400 shrink-0" />
                                                    <span className="text-xs font-bold">{match.profile.cleanliness} Cleanliness</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between">
                                            <span className="text-sm font-black text-slate-800">LKR {match.profile.budget.toLocaleString()}/mo</span>
                                            <button className="flex items-center gap-2 text-blue-600 font-black text-[10px] uppercase tracking-widest hover:gap-3 transition-all">
                                                Chat with {match.profile.user.name.split(' ')[0]} <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {matches.length === 0 && (
                                <div className="text-center py-12">
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                        <Users size={32} />
                                    </div>
                                    <h4 className="text-slate-900 font-bold">No exact matches yet</h4>
                                    <p className="text-slate-500 text-sm">Be the first one in your circle to set preferences! More students are joining every hour.</p>
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
