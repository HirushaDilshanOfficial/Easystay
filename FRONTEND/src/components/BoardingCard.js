import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const BoardingCard = ({ boarding }) => {
    const imageUrl = boarding.images && boarding.images.length > 0
        ? `http://localhost:5001/uploads/${boarding.images[0]}`
        : 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <div className="boarding-card">
            <div className="card-image">
                <img src={imageUrl} alt={boarding.title} />
                <span className="availability-badge">
                    {boarding.availability ? 'Available' : 'Occupied'}
                </span>
            </div>
            <div className="card-content">
                <h3>{boarding.title}</h3>
                <p className="address">
                    <MapPin size={16} /> {boarding.address}
                </p>
                <div className="card-details">
                    <span>{boarding.roomType} Room</span>
                    <span>{boarding.genderType}</span>
                </div>
                
                {boarding.facilities && boarding.facilities.length > 0 && (
                    <div className="card-facilities" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '15px' }}>
                        {boarding.facilities.map((fac, idx) => (
                            <span key={idx} style={{ fontSize: '12px', background: '#e0f2fe', color: '#0284c7', padding: '2px 8px', borderRadius: '10px' }}>
                                {fac === 'Food' ? 'Meals Included' : fac}
                            </span>
                        ))}
                    </div>
                )}
                <div className="card-footer">
                    <div className="price">
                        <span>LKR {boarding.pricePerMonth.toLocaleString()}/mo</span>
                    </div>
                    <Link to={`/boarding/${boarding._id}`} className="btn-primary">
                        View Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BoardingCard;
