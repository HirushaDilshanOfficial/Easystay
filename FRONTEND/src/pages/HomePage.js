import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BoardingCard from '../components/BoardingCard';
import { Search } from 'lucide-react';

const HomePage = () => {
    const [boardings, setBoardings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchBoardings = async () => {
            try {
                // Pass search query if it exists
                const url = searchTerm ? `/boardings?search=${encodeURIComponent(searchTerm)}` : '/boardings';
                const res = await api.get(url);
                setBoardings(res.data.data || []);
            } catch (err) {
                console.error('Error fetching boardings:', err);
            } finally {
                setLoading(false);
            }
        };
        // Debounce search a little bit or just call directly since it's local dev,
        // but adding it to dependency array makes it fetch as user types.
        fetchBoardings();
    }, [searchTerm]);

    if (loading) return <div className="loading">Loading boardings...</div>;

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>Find Your Perfect Stay Near University</h1>
                <p>Browse available boarding places to fit your needs.</p>

                <div className="search-container">
                    <Search className="search-icon" size={20} />
                    <input
                        type="text"
                        placeholder="Search by location, university, or keyword (e.g. Peradeniya, AC)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                </div>
            </header>

            {boardings.length === 0 ? (
                <div className="no-boardings">No boardings available at the moment.</div>
            ) : (
                <div className="boarding-grid">
                    {boardings.map((boarding) => (
                        <BoardingCard key={boarding._id} boarding={boarding} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default HomePage;
