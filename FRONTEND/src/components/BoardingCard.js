import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Star } from 'lucide-react';

const BoardingCard = ({ boarding }) => {
    // Try to use the first image, or a placeholder if none exists
    const imageUrl = boarding.images && boarding.images.length > 0
        ? `http://localhost:5001/${boarding.images[0]}`
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
                <div className="card-footer">
                    <div className="price">
                        <DollarSign size={16} />
                        <span>{boarding.pricePerMonth}/mo</span>
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
