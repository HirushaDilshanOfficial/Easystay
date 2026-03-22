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

    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        if (boarding && boarding.images && boarding.images.length > 0) {
            setMainImage(boarding.images[0]);
        }
    }, [boarding]);

    if (loading) return <div className="loading">Loading details...</div>;
    if (!boarding) return <div className="error">Boarding not found</div>;

    const getFullImageUrl = (img) => {
        return img.startsWith('http') ? img : `http://localhost:5001/uploads/${img}`;
    };

    return (
        <div className="details-page">
            <div className="details-header">
                <Link to="/" className="back-link">← Back to Listings</Link>
                <h1>{boarding.title}</h1>
                <p className="address"><MapPin size={18} /> {boarding.address}</p>
            </div>

            <div className="details-content">
                <div className="details-main">
                    <div className="gallery-container">
                        <div className="main-image-wrapper">
                            <img src={getFullImageUrl(mainImage || 'https://via.placeholder.com/800x400?text=No+Image')} alt={boarding.title} className="main-image" />
                        </div>
                        {boarding.images && boarding.images.length > 1 && (
                            <div className="thumbnails-grid">
                                {boarding.images.map((img, index) => (
                                    <div 
                                        key={index} 
                                        className={`thumbnail-item ${mainImage === img ? 'active' : ''}`}
                                        onClick={() => setMainImage(img)}
                                    >
                                        <img src={getFullImageUrl(img)} alt={`Thumbnail ${index + 1}`} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

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

                    <AppointmentBooking boardingId={boarding._id} ownerName={boarding.ownerName} ownerPhone={boarding.contactNumber} />
                </div>
            </div>
        </div>
    );
};

const AppointmentBooking = ({ boardingId, ownerName, ownerPhone }) => {
    const [showContact, setShowContact] = useState(false);
    const [bookingMode, setBookingMode] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '' });

    useEffect(() => {
        if (bookingMode && date) {
            fetchSlots();
        }
    }, [bookingMode, date]);

    const fetchSlots = async () => {
        setLoadingSlots(true);
        try {
            const res = await api.get(`/appointments/available/${boardingId}/${date}`);
            setSlots(res.data.data);
        } catch (err) {
            console.error('Error fetching slots:', err);
        } finally {
            setLoadingSlots(false);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/book', {
                boardingId,
                date,
                timeSlot: selectedSlot,
                userName: userData.name,
                userEmail: userData.email,
                userPhone: userData.phone
            });
            setBookingSuccess(true);
            setShowContact(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed');
        }
    };

    if (bookingSuccess) {
        return (
            <div className="appointment-card success">
                <h3 className="text-success">Appointment Booked! ✅</h3>
                <p>Your slot is confirmed for <strong>{date}</strong> at <strong>{selectedSlot}</strong>.</p>
                <div className="contact-reveal">
                    <h4>Owner Contact Info:</h4>
                    <p><User size={16} /> {ownerName}</p>
                    <p><Phone size={16} /> {ownerPhone}</p>
                </div>
            </div>
        );
    }

    if (bookingMode) {
        return (
            <div className="appointment-card booking-form">
                <button className="back-btn" onClick={() => setBookingMode(false)}>← Back</button>
                <h3>Book a Visit</h3>
                
                <div className="form-group-lite">
                    <label>Pick a Date:</label>
                    <input type="date" value={date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
                </div>

                <div className="slots-container">
                    <label>Available Slots:</label>
                    {loadingSlots ? <p>Loading slots...</p> : (
                        <div className="slots-grid">
                            {slots.map(slot => (
                                <button 
                                    key={slot.time}
                                    disabled={slot.isBooked}
                                    className={`slot-btn ${selectedSlot === slot.time ? 'selected' : ''} ${slot.isBooked ? 'booked' : ''}`}
                                    onClick={() => setSelectedSlot(slot.time)}
                                >
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedSlot && (
                    <form onSubmit={handleBooking} className="user-info-form">
                        <input type="text" placeholder="Your Name" required value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} />
                        <input type="email" placeholder="Your Email" required value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} />
                        <input type="text" placeholder="Your Phone" required value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} />
                        <button type="submit" className="btn-primary full-width">Confirm Appointment</button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="appointment-card">
            <h3>Interested in this place?</h3>
            <p className="text-muted small">Book a visit to see the place in person and get the owner's contact information.</p>
            <button className="btn-primary full-width" onClick={() => setBookingMode(true)}>Make Appointment</button>
        </div>
    );
};

export default BoardingDetailsPage;
