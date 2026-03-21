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
        <div className="home-page">
            <header className="home-header">
                <h1>Find Your Perfect Stay Near University</h1>
                <p>Browse available boarding places to fit your needs.</p>

                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by location, university, or keyword (e.g. SLIIT, AC)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </header>

            <div className="home-layout" style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
                <aside className="sidebar-filters" style={{ width: '280px', flexShrink: 0, backgroundColor: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
                        <Filter size={20} className="text-primary" />
                        <h2 style={{ fontSize: '1.25rem', margin: 0 }}>Filter by</h2>
                    </div>

                    <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Max Budget (LKR)</h3>
                        <input 
                            type="range" 
                            min="5000" 
                            max="60000" 
                            step="1000" 
                            value={maxPrice} 
                            onChange={(e) => setMaxPrice(Number(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                            <span>5k</span>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{maxPrice >= 60000 ? 'Any' : maxPrice.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Max Distance to Uni (km)</h3>
                        <input 
                            type="range" 
                            min="0.5" 
                            max="10" 
                            step="0.5" 
                            value={maxDistance} 
                            onChange={(e) => setMaxDistance(Number(e.target.value))}
                            style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: '#64748b' }}>
                            <span>0.5km</span>
                            <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{maxDistance >= 10 ? 'Any' : `${maxDistance}km`}</span>
                        </div>
                    </div>

                    <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Room Type</h3>
                        <select 
                            value={roomType} 
                            onChange={(e) => setRoomType(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">Any Room Type</option>
                            <option value="Single">Single Room</option>
                            <option value="Shared">Shared Room</option>
                        </select>
                    </div>

                    <div className="filter-group" style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Gender</h3>
                        <select 
                            value={genderType} 
                            onChange={(e) => setGenderType(e.target.value)}
                            style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                        >
                            <option value="">Any</option>
                            <option value="Female">Female Only</option>
                            <option value="Male">Male Only</option>
                        </select>
                    </div>

                    <div className="filter-group">
                        <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Facilities</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {facilityOptions.map(fac => (
                                <label key={fac} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem', color: '#334155' }}>
                                    <input 
                                        type="checkbox" 
                                        checked={facilitiesFilter.includes(fac)} 
                                        onChange={() => handleFacilityChange(fac)} 
                                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                                    />
                                    {fac === 'Food' ? 'Meals Included' : fac}
                                </label>
                            ))}
                        </div>
                    </div>
                </aside>

                <main style={{ flex: 1 }}>
                    {loading ? (
                        <div className="loading">Loading boardings...</div>
                    ) : boardings.length === 0 ? (
                        <div className="no-boardings" style={{ textAlign: 'center', padding: '3rem', backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0' }}>No boardings match your exact filters. Adjust your budget or facilities.</div>
                    ) : (
                        <div className="boarding-grid">
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
