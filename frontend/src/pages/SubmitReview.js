import React from 'react';
import { useNavigate } from 'react-router-dom';
import ReviewForm from '../components/ReviewForm';

export default function SubmitReview() {
  const navigate = useNavigate();

  const handleSubmitted = (review) => {
    sessionStorage.setItem('myReview', JSON.stringify(review));
    setTimeout(() => navigate('/'), 1200);
  };

  return (
    <div className="page" style={{ maxWidth: 680 }}>
      <div className="page-title">
        <h1>Feedback &amp; Reviews</h1>
        <p className="subtitle">Share your honest experience with other guests</p>
      </div>
      <div className="form-card">
        <ReviewForm onSubmitted={handleSubmitted} />
      </div>
    </div>
  );
}