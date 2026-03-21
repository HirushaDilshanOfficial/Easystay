import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, User, CheckCircle } from 'lucide-react';
import api from '../api';

const BoardingDetailsPage = () => {
    const { id } = useParams();
    const [boarding, setBoarding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImageIdx, setMainImageIdx] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingSuccess, setBookingSuccess] = useState(false);

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

    const getFullImageUrl = (img) => {
        if (!img) return 'https://via.placeholder.com/800x400?text=No+Image';
        return img.startsWith('http') ? img : `http://localhost:5001/uploads/${img}`;
    };

    const imageUrl = boarding.images && boarding.images.length > 0
        ? getFullImageUrl(boarding.images[mainImageIdx])
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
                    <img src={imageUrl} alt={boarding.title} className="main-image" style={{ width: '100%', borderRadius: '12px', marginBottom: '1rem', objectFit: 'cover', height: '400px' }} />
                    
                    {boarding.images && boarding.images.length > 1 && (
                        <div className="thumbnail-gallery" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                            {boarding.images.map((img, idx) => (
                                <img 
                                    key={idx} 
                                    src={getFullImageUrl(img)} 
                                    alt={`thumbnail ${idx}`} 
                                    onClick={() => setMainImageIdx(idx)}
                                    style={{ 
                                        width: '80px', 
                                        height: '60px', 
                                        objectFit: 'cover', 
                                        borderRadius: '6px', 
                                        cursor: 'pointer',
                                        border: mainImageIdx === idx ? '3px solid #0f172a' : '1px solid #cbd5e1',
                                        opacity: mainImageIdx === idx ? 1 : 0.6
                                    }} 
                                />
                            ))}
                        </div>
                    )}

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
                        <h2>LKR {boarding.pricePerMonth.toLocaleString()} <span>/ month</span></h2>
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
                        <p style={{ marginBottom: '15px' }}><User size={16} /> <strong>{boarding.ownerName || 'Owner Profile Hidden'}</strong></p>
                        
                        {bookingSuccess ? (
                            <div className="success-message" style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '8px', fontSize: '0.9rem', marginTop: '10px' }}>
                                <CheckCircle size={18} style={{ marginBottom: '5px' }}/> <br/>
                                <strong>Request Sent!</strong> <br/>
                                The owner will review your appointment and get back to you shortly with their direct contact details.
                            </div>
                        ) : isBooking ? (
                            <div className="booking-form" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '10px' }}>
                                <input type="date" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                <input type="time" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                                <textarea placeholder="Any message to the owner?" rows="2" style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}></textarea>
                                <button 
                                    className="btn-primary" 
                                    onClick={() => setBookingSuccess(true)}
                                    style={{ width: '100%', marginTop: '5px' }}
                                >
                                    Confirm Appointment
                                </button>
                                <button 
                                    onClick={() => setIsBooking(false)}
                                    style={{ width: '100%', padding: '8px', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div>
                                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '15px' }}>
                                    Phone number is hidden until an appointment is arranged.
                                </p>
                                <button 
                                    className="btn-primary" 
                                    style={{ width: '100%', padding: '12px' }}
                                    onClick={() => setIsBooking(true)}
                                >
                                    Make an Appointment
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BoardingDetailsPage;
