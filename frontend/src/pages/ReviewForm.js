import React, { useState, useEffect } from 'react';
import api from '../api';

const REASONS = [
  'Spam or advertising',
  'Harassment or abuse',
  'False information',
  'Hate speech',
  'Fraud or scam',
  'Other'
];

const STATUS_COLORS = {
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'In-Progress': 'bg-blue-50 text-blue-700 border-blue-200',
  'Solved': 'bg-green-50 text-green-700 border-green-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200'
};

export default function ReviewForm() {
  const [boardingId, setBoardingId] = useState('');
  const [reason, setReason]       = useState('');
  const [details, setDetails]     = useState('');
  const [reportStatus, setReportStatus] = useState('');
  const [history, setHistory]     = useState([]);

  const loadHistory = async () => {
    try {
      const res = await api.get('/reports/my');
      setHistory(res.data.data || []);
    } catch (err) {}
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const submitReport = async (e) => {
    e.preventDefault();
    if (!boardingId.trim()) return setReportStatus('error:Please enter a Boarding ID.');
    if (!reason)            return setReportStatus('error:Please select a reason.');
    
    try {
      await api.post('/reports', { boardingId, reason, details });
      setReportStatus('success:Report submitted. Our moderation team will review it shortly.');
      setBoardingId(''); setReason(''); setDetails('');
      loadHistory();
    } catch (err) {
      setReportStatus(`error:${err.response?.data?.error || 'Failed to submit report. Please try again.'}`);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
        <div className="bg-red-50 text-red-600 p-3 rounded-2xl text-2xl">⚠️</div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 leading-tight">Report suspicious comment</h1>
          <p className="text-slate-500 text-sm font-medium">This report will be reviewed by our moderation team.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form Section */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <form onSubmit={submitReport} className="space-y-6">
              <div className="form-group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Boarding ID *</label>
                <input
                  className="w-full p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none"
                  value={boardingId}
                  onChange={e => setBoardingId(e.target.value)}
                  placeholder="e.g. BRD-20240312-7841"
                />
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Reason for Report *</label>
                <div className="flex flex-wrap gap-2">
                  {REASONS.map(r => (
                    <button
                      type="button"
                      key={r}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${
                        reason === r 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                          : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'
                      }`}
                      onClick={() => setReason(r)}
                    >{r}</button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 block">Details (optional)</label>
                <textarea
                  className="w-full p-3 bg-slate-50 border border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Provide more context…"
                  rows={4}
                />
              </div>

              {reportStatus && (
                <div className={`p-4 rounded-xl text-sm font-bold border ${
                  reportStatus.startsWith('success') 
                    ? 'bg-green-50 text-green-700 border-green-100' 
                    : 'bg-red-50 text-red-700 border-red-100'
                }`}>
                  {reportStatus.replace(/^(success|error):/, '')}
                </div>
              )}

              <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-slate-200 active:scale-95">
                Submit Report
              </button>
            </form>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Recently Submitted</h2>
          {history.length === 0 ? (
            <div className="bg-slate-50 rounded-3xl p-12 text-center border border-dashed border-slate-200">
              <div className="text-4xl mb-3 opacity-20">📋</div>
              <p className="text-slate-400 font-bold text-sm">No recent inquiries.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map(item => (
                <div key={item._id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-xs font-black text-blue-600 uppercase tracking-wider mb-1">
                        {item.reason}
                      </div>
                      <div className="text-slate-900 font-bold">
                        Targeting ID: <span className="font-mono text-xs">{item.boardingId}</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${STATUS_COLORS[item.status] || ''}`}>
                      {item.status}
                    </div>
                  </div>
                  
                  {item.details && (
                    <p className="text-slate-500 text-xs font-medium mb-3 bg-slate-50 p-3 rounded-xl">
                      {item.details}
                    </p>
                  )}

                  {item.adminResponse ? (
                    <div className="mt-3 pt-3 border-t border-slate-50">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Admin Response</div>
                      <p className="text-slate-700 text-sm font-bold bg-green-50/50 p-3 rounded-xl border border-green-100/50">
                        {item.adminResponse}
                      </p>
                    </div>
                  ) : (
                    <div className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-2 italic px-1">
                      Awaiting response...
                    </div>
                  )}
                  
                  <div className="text-[10px] font-bold text-slate-400 mt-4 text-right">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}