import React, { useEffect, useState } from 'react';
import ReviewList from '../components/ReviewList';

const API = 'http://localhost:5000';

export default function Home() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [myReview, setMyReview] = useState(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('myReview');
    if (saved) setMyReview(JSON.parse(saved));

    fetch(`${API}/api/reviews`)
      .then(res => res.json())
      .then(data => { setReviews(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const avgLabel = avg >= 4.5 ? 'Excellent' : avg >= 3.5 ? 'Great' : avg >= 2.5 ? 'Good' : avg >= 1.5 ? 'Average' : reviews.length ? 'Bad' : null;

  return (
    <div className="page">
      <div className="page-title">
        <h1>🏨 EasyStay Reviews</h1>
        <p className="subtitle">Real feedback from verified guests</p>
      </div>

      {avgLabel && (
        <div className="rating-summary">
          <div className="rs-top">
            <span className="rs-title">Rating Summary</span>
            <span className="rs-badge">{avgLabel.toUpperCase()}!</span>
          </div>
          <div className="stars" style={{ fontSize: '1.3rem', gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <span key={i} className={`star${i <= Math.round(avg) ? ' filled' : ''}`} style={{ fontSize: '1.3rem' }}>★</span>
            ))}
          </div>
          <p className="rs-quote">
            "{myReview ? `You rated this stay — thank you for your feedback!` : `Average rating: ${avg.toFixed(1)} out of 5 from ${reviews.length} guest${reviews.length !== 1 ? 's' : ''}`}"
          </p>
        </div>
      )}

      {loading ? (
        <div className="empty"><div className="empty-icon">⏳</div><p>Loading reviews…</p></div>
      ) : (
        <ReviewList reviews={reviews} myReview={myReview} />
      )}
    </div>
  );
}