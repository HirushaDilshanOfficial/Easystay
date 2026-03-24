import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BoardingCard from '../components/BoardingCard';
import { Search, Filter } from 'lucide-react';

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
            {/* Header / Search Section */}
            <header className="bg-white border-b border-slate-200 pt-28 pb-12 px-6 text-center shadow-sm">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">Find Your Perfect Stay</h1>
                    <p className="text-slate-500 font-medium text-lg mb-10">Browse verified boarding places near your university.</p>

                    <div className="relative flex items-center bg-white rounded-full shadow-lg shadow-slate-200 border border-slate-100 px-4 py-3 mx-auto w-full max-w-2xl transition-all focus-within:ring-4 focus-within:ring-blue-500/20 focus-within:border-blue-500">
                        <Search className="text-slate-400 ml-2 shrink-0" size={22} />
                        <input
                            type="text"
                            placeholder="Search by location, university, or keyword (e.g. SLIIT)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none px-4 py-2 text-slate-700 font-medium placeholder-slate-400 w-full"
                        />
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-8 items-start">
                {/* Sidebar Filters */}
                <aside className="w-full md:w-72 shrink-0 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm sticky top-24">
                    <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Filter size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Max Budget</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{maxPrice >= 60000 ? 'Any' : `LKR ${maxPrice/1000}k`}</span>
                        </div>
                        <input 
                            type="range" min="5000" max="60000" step="1000" 
                            value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="mb-6">
                        <div className="flex justify-between items-end mb-2">
                            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Distance</h3>
                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{maxDistance >= 10 ? 'Any' : `${maxDistance} km`}</span>
                        </div>
                        <input 
                            type="range" min="0.5" max="10" step="0.5" 
                            value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))}
                            className="w-full accent-blue-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Room Type</h3>
                        <select 
                            value={roomType} onChange={(e) => setRoomType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                        >
                            <option value="">Any Room Type</option>
                            <option value="Single">Single Room</option>
                            <option value="Shared">Shared Room</option>
                        </select>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Gender</h3>
                        <select 
                            value={genderType} onChange={(e) => setGenderType(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-3 outline-none"
                        >
                            <option value="">Any Gender</option>
                            <option value="Female">Female Only</option>
                            <option value="Male">Male Only</option>
                        </select>
                    </div>

                    <div>
                        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Facilities</h3>
                        <div className="flex flex-col gap-3">
                            {facilityOptions.map(fac => (
                                <label key={fac} className="flex items-center gap-3 cursor-pointer group">
                                    <input 
                                        type="checkbox" checked={facilitiesFilter.includes(fac)} onChange={() => handleFacilityChange(fac)} 
                                        className="w-4 h-4 text-blue-600 bg-slate-50 border-slate-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                    />
                                    <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                                        {fac === 'Food' ? 'Meals Included' : fac}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 w-full relative z-0">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
                        </div>
                    ) : boardings.length === 0 ? (
                        <div className="text-center bg-white py-16 px-6 rounded-2xl border border-slate-200 border-dashed">
                            <h3 className="text-lg font-bold text-slate-900 mb-2">No Properties Found</h3>
                            <p className="text-slate-500">We couldn't find any boardings matching your exact criteria. Try adjusting your filters or budget.</p>
                            <button 
                                onClick={() => { setSearchTerm(''); setMaxPrice(60000); setMaxDistance(10); setRoomType(''); setGenderType(''); setFacilitiesFilter([]); }}
                                className="mt-6 px-6 py-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-xl transition-colors text-sm"
                            >
                                Clear All Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {boardings.map((boarding) => (
                                <BoardingCard key={boarding._id} boarding={boarding} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default HomePage;
