import React, { useEffect, useState } from 'react';

export default function Analytics() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/reviews')
      .then(r => r.json())
      .then(setReviews)
      .catch(() => {});
  }, []);

  const total = reviews.length;
  const avg   = total ? (reviews.reduce((s, r) => s + r.rating, 0) / total).toFixed(2) : '—';
  const pos   = reviews.filter(r => r.rating >= 4).length;
  const crit  = reviews.filter(r => r.rating <= 2).length;

  const dist = [5,4,3,2,1].map(n => ({
    star: n,
    count: reviews.filter(r => r.rating === n).length,
    pct: total ? Math.round((reviews.filter(r => r.rating === n).length / total) * 100) : 0,
  }));

  return (
    <div className="page">
      <div className="page-title">
        <h1>📊 Analytics</h1>
        <p className="subtitle">Guest satisfaction at a glance</p>
      </div>

      <div className="stat-grid">
        <div className="stat-card"><div className="stat-value">{total}</div><div className="stat-label">Total Reviews</div></div>
        <div className="stat-card"><div className="stat-value">{avg}</div><div className="stat-label">Avg Rating</div></div>
        <div className="stat-card"><div className="stat-value">{pos}</div><div className="stat-label">Positive (4–5★)</div></div>
        <div className="stat-card"><div className="stat-value">{crit}</div><div className="stat-label">Critical (1–2★)</div></div>
      </div>

      <div className="form-card">
        <h3 style={{ fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.8px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
          Rating Distribution
        </h3>
        {dist.map(d => (
          <div className="bar-row" key={d.star}>
            <span className="bar-label" style={{ color: 'var(--gold)' }}>{'★'.repeat(d.star)}</span>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: `${d.pct}%`,
                background: d.star >= 4 ? 'var(--blue)' : d.star === 3 ? '#a5b4fc' : 'var(--red)'
              }} />
            </div>
            <span className="bar-count">{d.count} ({d.pct}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}