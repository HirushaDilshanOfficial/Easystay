import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import BoardingCard from '../components/BoardingCard';

const HomePage = () => {
    const [boardings, setBoardings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBoardings = async () => {
            try {
                const res = await api.get('/boardings');
                setBoardings(res.data.data || []);
            } catch (err) {
                console.error('Error fetching boardings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBoardings();
    }, []);

    if (loading) return <div className="loading">Loading boardings...</div>;

    return (
        <div className="home-page">
            <header className="home-header">
                <h1>Find Your Perfect Stay Near University</h1>
                <p>Browse available boarding places to fit your needs.</p>
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
