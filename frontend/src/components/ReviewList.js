import React from 'react';

const AVATARS = ['😊','😎','🥳','🤩','😄','😁','🙂','😀','🤗','😏'];

function getRatingLabel(r) {
  if (r >= 5) return { label: 'Excellent', cls: 'badge-excellent' };
  if (r >= 4) return { label: 'Great',     cls: 'badge-great' };
  if (r >= 3) return { label: 'Good',      cls: 'badge-good' };
  if (r >= 2) return { label: 'Average',   cls: 'badge-average' };
  return           { label: 'Bad',         cls: 'badge-bad' };
}

function StarRow({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`star${i <= rating ? ' filled' : ''}`}>★</span>
      ))}
    </div>
  );
}

function formatDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function ReviewCard({ review: r, isMine, avatarIdx = 0 }) {
  const { label, cls } = getRatingLabel(r.rating);
  const emoji = isMine ? '😊' : AVATARS[avatarIdx % AVATARS.length];
  // backend uses 'text' field, fallback to other possible field names
  const comment = r.text || r.review || r.comment || '';
  const name = isMine ? 'You' : (r.anonymous ? 'Anonymous' : (r.name || r.guestName || 'Guest'));

  return (
    <div className={`review-card${isMine ? ' mine' : ''}`}>
      <div className="rc-header">
        <div className="rc-user">
          <div className="avatar">{emoji}</div>
          <div>
            <div className="rc-name">{name}</div>
            <StarRow rating={r.rating} />
          </div>
        </div>
        <span className={`rating-badge ${cls}`}>{label}</span>
      </div>
      {comment && <p className="rc-comment">"{comment}"</p>}
      <p className="rc-date">{isMine ? 'Just now' : formatDate(r.createdAt)}</p>
    </div>
  );
}

export default function ReviewList({ reviews, myReview }) {
  const others = myReview
    ? reviews.filter(r => r._id !== myReview._id)
    : reviews;

  return (
    <div>
      {myReview && (
        <>
          <div className="section-label">
            <div className="section-label-left"><span>✅</span> Your Review</div>
          </div>
          <ReviewCard review={myReview} isMine />
        </>
      )}

      {others.length > 0 && (
        <>
          <div className="section-label">
            <div className="section-label-left"><span>👥</span> Other Guests</div>
          </div>
          {others.map((r, i) => (
            <ReviewCard key={r._id || i} review={r} avatarIdx={i} />
          ))}
        </>
      )}

      {reviews.length === 0 && !myReview && (
        <div className="empty">
          <div className="empty-icon">💬</div>
          <p>No approved reviews yet.</p>
        </div>
      )}
    </div>
  );
}