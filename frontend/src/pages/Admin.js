import React, { useEffect, useState } from 'react';

const REASONS = ['Spam or advertising','Harassment or abuse','False information','Hate speech','Fraud or scam','Other'];

export default function Admin() {
  const [reviews, setReviews]     = useState([]);
  const [tab, setTab]             = useState('reviews');  // 'reviews' | 'report'
  const [boardingId, setBoardingId] = useState('');
  const [reason, setReason]       = useState('');
  const [details, setDetails]     = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [deleting, setDeleting]   = useState(null);

  const load = () => {
    fetch('http://localhost:5000/api/reviews')
      .then(r => r.json()).then(setReviews).catch(() => {});
  };

  useEffect(load, []);

  const deleteReview = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await fetch(`http://localhost:5000/api/reviews/${id}`, { method: 'DELETE' });
      load();
    } catch {}
    setDeleting(null);
  };

  const submitReport = (e) => {
    e.preventDefault();
    if (!boardingId.trim()) return setReportStatus('error:Please enter a Boarding ID.');
    if (!reason)            return setReportStatus('error:Please select a reason.');
    setReportStatus('success:Report submitted. Our moderation team will review it shortly.');
    setBoardingId(''); setReason(''); setDetails('');
  };

  return (
    <div className="page">
      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
        <button
          className={`btn ${tab === 'reviews' ? 'btn-blue' : 'btn-outline'}`}
          onClick={() => setTab('reviews')}
        >📋 Manage Reviews</button>
        <button
          className={`btn ${tab === 'report' ? 'btn-blue' : 'btn-outline'}`}
          onClick={() => setTab('report')}
        >🚨 Report Comment</button>
      </div>

      {tab === 'reviews' && (
        <>
          <div className="page-title">
            <h1>Manage Reviews</h1>
            <p className="subtitle">View and remove guest reviews</p>
          </div>

          <div className="stat-grid" style={{ marginBottom: 24 }}>
            <div className="stat-card"><div className="stat-value">{reviews.length}</div><div className="stat-label">Total</div></div>
            <div className="stat-card">
              <div className="stat-value">
                {reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : '—'}
              </div>
              <div className="stat-label">Avg Rating</div>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="empty"><div className="empty-icon">📋</div><p>No reviews found.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>#</th><th>Guest</th><th>Review</th><th>Rating</th><th>Date</th><th>Action</th></tr></thead>
                <tbody>
                  {reviews.map((r, i) => (
                    <tr key={r._id || i}>
                      <td style={{ color:'var(--text-dim)', fontSize:'0.78rem' }}>{i+1}</td>
                      <td style={{ fontWeight: 500 }}>{r.name || <span style={{color:'var(--text-dim)'}}>Anonymous</span>}</td>
                      <td style={{ maxWidth: 240, color:'var(--text-muted)' }}>
                        <span style={{ display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                          {r.review || r.comment || r.text}
                        </span>
                      </td>
                      <td>
                        <span style={{ color:'var(--gold)', fontWeight:600 }}>{'★'.repeat(r.rating)}</span>
                        <span style={{ color:'var(--text-muted)', fontSize:'0.78rem', marginLeft:4 }}>{r.rating}/5</span>
                      </td>
                      <td style={{ color:'var(--text-dim)', fontSize:'0.8rem' }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <button
                          className="btn btn-danger"
                          style={{ padding:'6px 14px', fontSize:'0.78rem', borderRadius:8 }}
                          disabled={deleting === r._id}
                          onClick={() => deleteReview(r._id)}
                        >{deleting === r._id ? '…' : 'Delete'}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'report' && (
        <>
          <div className="page-title">
            <div className="report-hero">
              <div className="report-icon">⚠️</div>
              <div>
                <h1>Report suspicious comment</h1>
                <p className="subtitle">This report will be reviewed by our moderation team.</p>
              </div>
            </div>
          </div>

          <div className="form-card">
            <form onSubmit={submitReport}>
              <div className="form-group">
                <label>Boarding ID *</label>
                <input
                  value={boardingId}
                  onChange={e => setBoardingId(e.target.value)}
                  placeholder="e.g. BRD-20240312-7841"
                />
                <p className="hint">Enter the review ID associated with the flagged comment.</p>
              </div>

              <div className="form-group">
                <label>Reason for Report *</label>
                <div className="reason-grid">
                  {REASONS.map(r => (
                    <button
                      type="button"
                      key={r}
                      className={`reason-btn${reason === r ? ' selected' : ''}`}
                      onClick={() => setReason(r)}
                    >{r}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Details (optional)</label>
                <textarea
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Provide more context about why this comment is suspicious…"
                  rows={4}
                />
              </div>

              {reportStatus && (
                <div className={`alert alert-${reportStatus.startsWith('success') ? 'success' : 'error'}`}>
                  {reportStatus.replace(/^(success|error):/, '')}
                </div>
              )}

              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <button type="submit" className="btn btn-blue">Submit Report</button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}