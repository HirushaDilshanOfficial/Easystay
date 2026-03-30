import React, { useState } from 'react';

const API = 'http://localhost:5000';

const LABELS = ['', 'Bad', 'Average', 'Good', 'Great', 'Excellent'];

export default function ReviewForm({ onSubmitted }) {
  const [bookingId, setBookingId] = useState('');
  const [text, setText]           = useState('');
  const [rating, setRating]       = useState(0);
  const [hover, setHover]         = useState(0);
  const [anonymous, setAnonymous] = useState(false);
  const [status, setStatus]       = useState('');
  const [loading, setLoading]     = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!bookingId.trim()) return setStatus('error:Please enter your Booking ID.');
    if (!rating)           return setStatus('error:Please select a star rating.');
    if (!text.trim())      return setStatus('error:Please write a comment.');

    setLoading(true);
    setStatus('');

    try {
      const res = await fetch(`${API}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, text, rating, anonymous }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success:Review submitted! It will appear after approval.');
        const submitted = { text, rating, anonymous, createdAt: new Date().toISOString() };
        setBookingId(''); setText(''); setRating(0); setAnonymous(false);
        if (onSubmitted) onSubmitted(submitted);
      } else {
        // Show the exact error from backend (Invalid Booking ID, already reviewed, etc.)
        setStatus(`error:${data.error || 'Something went wrong.'}`);
      }
    } catch {
      setStatus('error:Cannot reach the backend. Make sure "node server.js" is running.');
    } finally {
      setLoading(false);
    }
  };

  const activeRating = hover || rating;
  const [sType, ...sMsgParts] = status ? status.split(':') : ['', ''];
  const sMsg = sMsgParts.join(':');

  return (
    <form onSubmit={submit}>

      {/* ── Booking ID ── */}
      <div className="form-group">
        <label>Booking ID *</label>
        <input
          type="text"
          value={bookingId}
          onChange={e => setBookingId(e.target.value)}
          placeholder="e.g. BRD-20240312-7841"
        />
        <p className="hint">Enter the Booking ID from your reservation confirmation.</p>
      </div>

      {/* ── Rating ── */}
      <div className="form-group">
        <label>Rating *</label>
        <div className="star-picker">
          {[1, 2, 3, 4, 5].map(i => (
            <span
              key={i}
              className={`star-pick${i <= activeRating ? ' filled' : ''}`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(i)}
            >★</span>
          ))}
        </div>
        <div className="rating-text">
          {activeRating > 0 ? `Rating: ${activeRating} — ${LABELS[activeRating]}` : 'Rating: 0'}
        </div>
      </div>

      {/* ── Comment ── */}
      <div className="form-group">
        <label>Comment *</label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Share your experience… (minimum 5 characters)"
          rows={5}
        />
      </div>

      {/* ── Status message ── */}
      {status && (
        <div className={`alert alert-${sType}`}>{sMsg}</div>
      )}

      {/* ── Footer ── */}
      <div className="form-footer">
        <label className="checkbox-row">
          <input
            type="checkbox"
            checked={anonymous}
            onChange={e => setAnonymous(e.target.checked)}
          />
          Submit as Anonymous
        </label>
        <button
          type="submit"
          className="btn btn-blue"
          disabled={loading}
          style={{ opacity: loading ? 0.7 : 1 }}
        >
          {loading ? 'Submitting…' : 'Submit Review'}
        </button>
      </div>

    </form>
  );
}