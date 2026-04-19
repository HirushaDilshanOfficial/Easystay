import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BoardingCard from '../components/BoardingCard';
import { Search, RotateCcw as RefreshIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import BoardingListingDashboard from './BoardingListingDashboard';
import heroBg from '../assets/hero-bg.png';
import SmartRoommateModal from '../components/SmartRoommateModal';
import { Users, Zap } from 'lucide-react';

const HomePage = () => {
    const [boardings, setBoardings] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [maxPrice, setMaxPrice] = useState(60000);
    const [maxDistance, setMaxDistance] = useState(10);
    const [roomType, setRoomType] = useState('');
    const [genderType, setGenderType] = useState('');
    const [facilitiesFilter, setFacilitiesFilter] = useState([]);
    const [isRoommateModalOpen, setIsRoommateModalOpen] = useState(false);

    const facilityOptions = ["WiFi", "AC", "Water", "Food", "CCTV", "Parking", "Laundry"];

    useEffect(() => {
        const fetchBoardings = async () => {
            try {
                let url = `/boardings?`;
                if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;
                if (maxPrice < 60000) url += `maxPrice=${maxPrice}&`;
                if (maxDistance < 10) url += `maxDistance=${maxDistance}&`;
                if (roomType) url += `roomType=${roomType}&`;
                if (genderType) url += `genderType=${genderType}&`;
                if (facilitiesFilter.length > 0) url += `facilities=${facilitiesFilter.join(',')}&`;

                const res = await api.get(url);
                setBoardings(res.data.data || []);
            } catch (err) {
                console.error('Error fetching boardings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardings();
    }, [searchTerm, maxPrice, maxDistance, roomType, genderType, facilitiesFilter]);

    const handleFacilityChange = (fac) => {
        if (facilitiesFilter.includes(fac)) {
            setFacilitiesFilter(facilitiesFilter.filter(f => f !== fac));
        } else {
            setFacilitiesFilter([...facilitiesFilter, fac]);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20">
            <Navbar />
            {/* Header / Search Section with Background Image */}
            <header 
                className="relative bg-slate-900 pt-24 pb-12 px-6 text-center shadow-lg border-b border-white/10"
                style={{ 
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${heroBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                }}
            >
                <div className="max-w-2xl mx-auto relative z-10">
                    <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-2 tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.3)]">
                        Find Your Perfect Stay
                    </h1>
                    <p className="text-gray-100 font-medium text-sm md:text-base mb-6 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                        Browse verified boarding places near your university.
                    </p>

                    <div className="relative flex items-center bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 px-5 py-3 mx-auto w-full max-w-lg transition-all focus-within:ring-4 focus-within:ring-blue-500/30 focus-within:border-white">
                        <Search className="text-slate-400 ml-2 shrink-0" size={22} />
                        <input
                            type="text"
                            placeholder="Search by location, university, or keyword (e.g. SLIIT)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-800 font-bold placeholder-slate-400 w-full text-lg"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Advertisements Banner */}
                <BoardingListingDashboard />

                {/* Unique Feature: Smart Roommate Matching Banner */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-200">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center shrink-0 border border-white/20">
                                <Users className="text-white" size={32} />
                            </div>
                            <div>
                                <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Smart Roommate Matching</h2>
                                <p className="text-blue-100 text-sm font-medium max-w-md opacity-90">
                                    Don't live alone! Find a compatible roommate based on your budget, study patterns, and lifestyle.
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsRoommateModalOpen(true)}
                            className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg transition-all hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
                        >
                            <Zap className="fill-blue-700" size={16} /> Find Roommate
                        </button>
                    </div>
                    {/* Decorative Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full -ml-16 -mb-16 blur-2xl"></div>
                </div>

                {/* Horizontal Top Filters */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 sticky top-[72px] z-20 backdrop-blur-md bg-white/90">
                    <div className="flex flex-col lg:flex-row gap-8 items-end">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 w-full">
                            {/* Budget Filter */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Max Budget</h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{maxPrice >= 60000 ? 'Any' : `LKR ${maxPrice/1000}k`}</span>
                                </div>
                                <input 
                                    type="range" min="5000" max="60000" step="1000" 
                                    value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Distance Filter */}
                            <div>
                                <div className="flex justify-between items-end mb-2">
                                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Distance</h3>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{maxDistance >= 10 ? 'Any' : `${maxDistance} km`}</span>
                                </div>
                                <input 
                                    type="range" min="0.5" max="10" step="0.5" 
                                    value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}
                                    className="w-full accent-blue-600 h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Room Type */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Room Type</h3>
                                <select 
                                    value={roomType} onChange={(e) => setRoomType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none font-medium transition-all"
                                >
                                    <option value="">Any Room</option>
                                    <option value="Single">Single Room</option>
                                    <option value="Shared">Shared Room</option>
                                </select>
                            </div>

                            {/* Gender */}
                            <div>
                                <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Gender</h3>
                                <select 
                                    value={genderType} onChange={(e) => setGenderType(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-100 text-slate-700 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-2.5 outline-none font-medium transition-all"
                                >
                                    <option value="">Any Gender</option>
                                    <option value="Female">Female Only</option>
                                    <option value="Male">Male Only</option>
                                </select>
                            </div>
                        </div>

                        {/* Reset Button */}
                        <div className="shrink-0">
                            <button 
                                onClick={() => { setSearchTerm(''); setMaxPrice(60000); setMaxDistance(10); setRoomType(''); setGenderType(''); setFacilitiesFilter([]); }}
                                className="px-4 py-2.5 text-slate-400 hover:text-blue-600 font-bold hover:bg-blue-50 rounded-xl transition-all text-xs flex items-center gap-2"
                            >
                                <RefreshIcon size={14} /> Clear
                            </button>
                        </div>
                    </div>

                    {/* Facilities Strip */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex flex-wrap gap-2 items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2">Facilities:</span>
                            {facilityOptions.map(fac => (
                                <button
                                    key={fac}
                                    onClick={() => handleFacilityChange(fac)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
                                        facilitiesFilter.includes(fac) 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-200' 
                                        : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
                                    }`}
                                >
                                    {fac === 'Food' ? 'Meals' : fac}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <main className="relative z-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : boardings.length === 0 ? (
                        <div className="text-center bg-white py-16 px-6 rounded-2xl border border-slate-200 border-dashed">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                                <Search size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Properties Found</h3>
                            <p className="text-slate-500 max-w-md mx-auto">We couldn't find any boardings matching your exact criteria. Try adjusting your filters or budget.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {boardings.map((boarding) => (
                                <BoardingCard key={boarding._id} boarding={boarding} />
                            ))}
                        </div>
                    )}
                </main>
            </div>

            <SmartRoommateModal 
                isOpen={isRoommateModalOpen} 
                onClose={() => setIsRoommateModalOpen(false)} 
            />
        </div>
    );
};

export default HomePage;
