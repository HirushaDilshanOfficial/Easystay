import React, { useState } from 'react';
import api from '../api';

const ratingLabel = (r) => ['', 'Bad', 'Average', 'Good', 'Great', 'Excellent'][Math.round(r)] || '';

export default function ReviewForm({ boardingId, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const user = storedUser?.user;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) { setError('Please select a star rating.'); return; }
    if (!user) { setError('Please login to submit a review.'); return; }
    setError('');
    setSubmitting(true);
    try {
      const res = await api.post(`/reviews/${boardingId}`, {
        userName: user.name,
        userEmail: user.email,
        rating,
        comment,
        isAnonymous
      });
      onSubmitted && onSubmitted(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Star Rating */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Your Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              onMouseEnter={() => setHoverRating(i)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
            >
              <span className={(hoverRating || rating) >= i ? 'text-amber-400' : 'text-slate-200'}>★</span>
            </button>
          ))}
          {(hoverRating || rating) > 0 && (
            <span className="ml-2 text-sm font-bold text-amber-600 self-center">
              {ratingLabel(hoverRating || rating)}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div>
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
          Your Comment
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
          rows={4}
          placeholder="Share your experience with this property…"
          className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-2xl p-3.5 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none font-medium"
        />
      </div>

      {/* Anonymous Toggle */}
      <div className="flex items-center gap-2 mt-2">
        <input
          type="checkbox"
          id="anonymous"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="anonymous" className="text-sm font-medium text-slate-600 cursor-pointer">
          Submit anonymously
        </label>
      </div>

      {error && (
        <p className="text-red-500 text-sm font-medium">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : '✉ Submit Review'}
      </button>
    </form>
  );
}
