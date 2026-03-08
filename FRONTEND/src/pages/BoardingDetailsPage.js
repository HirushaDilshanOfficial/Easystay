import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, User, CheckCircle } from 'lucide-react';
import api from '../api';

const BoardingDetailsPage = () => {
    const { id } = useParams();
    const [boarding, setBoarding] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBoarding = async () => {
            try {
                const res = await api.get(`/boardings/${id}`);
                setBoarding(res.data.data);
            } catch (err) {
                console.error('Error fetching boarding details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBoarding();
    }, [id]);

    if (loading) return <div className="loading">Loading details...</div>;
    if (!boarding) return <div className="error">Boarding not found</div>;

    const imageUrl = boarding.images && boarding.images.length > 0
        ? `http://localhost:5001/${boarding.images[0]}`
        : 'https://via.placeholder.com/800x400?text=No+Image';

    return (
        <div className="details-page">
            <div className="details-header">
                <Link to="/" className="back-link">← Back to Listings</Link>
                <h1>{boarding.title}</h1>
                <p className="address"><MapPin size={18} /> {boarding.address}</p>
            </div>

            <div className="details-content">
                <div className="details-main">
                    <img src={imageUrl} alt={boarding.title} className="main-image" />

                    <div className="section">
                        <h2>Description</h2>
                        <p>{boarding.description}</p>
                    </div>

                    <div className="section">
                        <h2>Facilities</h2>
                        <ul className="facilities-list">
                            {boarding.facilities.map((facility, index) => (
                                <li key={index}><CheckCircle size={16} /> {facility}</li>
                            ))}
                        </ul>
                    </div>
                </div>

                <div className="details-sidebar">
                    <div className="price-card">
                        <h2>Rs. {boarding.pricePerMonth} <span>/ month</span></h2>
                        <div className="status">
                            Status: <strong>{boarding.availability ? 'Available' : 'Occupied'}</strong>
                        </div>
                    </div>

                    <div className="info-card">
                        <h3>Key Details</h3>
                        <ul>
                            <li><strong>Room Type:</strong> {boarding.roomType}</li>
                            <li><strong>For:</strong> {boarding.genderType}</li>
                            <li><strong>Distance to Uni:</strong> {boarding.distanceFromUniversity} km</li>
                        </ul>
                    </div>

                    <div className="contact-card">
                        <h3>Contact Owner</h3>
                        <p><User size={16} /> {boarding.ownerName || 'N/A'}</p>
                        <p><Phone size={16} /> {boarding.contactNumber || 'N/A'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardingDetailsPage;
