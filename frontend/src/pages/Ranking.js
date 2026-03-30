import React, { useEffect, useState } from 'react';

function getRatingLabel(r) {
  if (r >= 5) return { label: 'Excellent', cls: 'badge-excellent' };
  if (r >= 4) return { label: 'Great',     cls: 'badge-great' };
  if (r >= 3) return { label: 'Good',      cls: 'badge-good' };
  if (r >= 2) return { label: 'Average',   cls: 'badge-average' };
  return           { label: 'Bad',         cls: 'badge-bad' };
}

const MEDALS = ['🥇','🥈','🥉'];
const AVATARS = ['😊','😎','🥳','🤩','😄','😁','🙂','😀','🤗','😏'];

export default function Ranking() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(r => r.json())
      .then(setReviews)
      .catch(() => {});
  }, []);

  const sorted = [...reviews].sort((a, b) => b.rating - a.rating);

  return (
    <div className="page">
      <div className="page-title">
        <h1>🏆 Top Reviews</h1>
        <p className="subtitle">Ranked by guest rating — highest first</p>
      </div>

      {sorted.length === 0 ? (
        <div className="empty"><div className="empty-icon">🏆</div><p>No reviews to rank yet.</p></div>
      ) : sorted.map((r, i) => {
        const { label, cls } = getRatingLabel(r.rating);
        return (
          <div className="review-card" key={r._id || i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            <div style={{
              minWidth: 44, height: 44,
              borderRadius: '50%',
              background: i < 3 ? '#eff4ff' : '#f9fafb',
              border: '1.5px solid var(--border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: i < 3 ? '1.4rem' : '0.88rem',
              color: 'var(--text-muted)',
              fontWeight: 700,
            }}>
              {i < 3 ? MEDALS[i] : `#${i+1}`}
            </div>
            <div style={{ flex: 1 }}>
              <div className="rc-header" style={{ marginBottom: 8 }}>
                <div className="rc-user">
                  <div className="avatar" style={{ width: 38, height: 38, fontSize: '1.2rem' }}>
                    {AVATARS[i % AVATARS.length]}
                  </div>
                  <div>
                    <div className="rc-name">{r.name || 'Anonymous'}</div>
                    <div className="stars">
                      {[1,2,3,4,5].map(s => (
                        <span key={s} className={`star${s <= r.rating ? ' filled' : ''}`}>★</span>
                      ))}
                    </div>
                  </div>
                </div>
                <span className={`rating-badge ${cls}`}>{label}</span>
              </div>
              {(r.review || r.comment || r.text) && (
                <p className="rc-comment">"{r.review || r.comment || r.text}"</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}