import React, { useEffect, useState } from 'react';
import api from '../api';

const STATUS_OPTS = ['Pending', 'In-Progress', 'Solved', 'Rejected'];

const STATUS_CHIPS = {
  'Pending': 'bg-amber-100 text-amber-700',
  'In-Progress': 'bg-blue-100 text-blue-700',
  'Solved': 'bg-green-100 text-green-700',
  'Rejected': 'bg-red-100 text-red-700'
};

export default function AdInquire() {
  const [reports, setReports]     = useState([]);
  const [deleting, setDeleting]   = useState(null);
  const [updating, setUpdating]   = useState(null);
  const [modalData, setModalData] = useState(null); // For response modal

  const load = () => {
    api.get('/reports')
      .then(res => setReports(res.data.data || []))
      .catch(() => {});
  };

  useEffect(load, []);

  const updateStatus = async (id, newStatus) => {
    setUpdating(id);
    try {
      await api.patch(`/reports/${id}`, { status: newStatus });
      load();
    } catch {}
    setUpdating(null);
  };

  const handleResponseSubmit = async (e) => {
    e.preventDefault();
    const { id, status, response } = modalData;
    setUpdating(id);
    try {
      await api.patch(`/reports/${id}`, { status, adminResponse: response });
      setModalData(null);
      load();
    } catch {}
    setUpdating(null);
  };

  const deleteReport = async (id) => {
    if (!window.confirm('Remove this inquiry/report?')) return;
    setDeleting(id);
    try {
      await api.delete(`/reports/${id}`);
      load();
    } catch {}
    setDeleting(null);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Manage inquiries</h1>
          <p className="text-slate-500 font-medium text-sm italic">Moderation panel for boarding owner reports</p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
              <div className="text-2xl font-black text-slate-900">{reports.length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total</div>
          </div>
          <div className="text-right">
              <div className="text-2xl font-black text-blue-600">{reports.filter(r => r.status === 'Pending').length}</div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending</div>
          </div>
        </div>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-3xl p-20 text-center border border-slate-100 shadow-sm">
          <div className="text-6xl mb-6 opacity-20">📥</div>
          <p className="text-slate-500 font-bold">Inbox is empty.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Inquiry Details</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Reporter</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-6">
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                           <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">{r.reason}</span>
                           <span className="text-[10px] font-mono text-slate-400">ID: {r.boardingId}</span>
                        </div>
                        <div className="text-slate-800 font-bold text-sm leading-relaxed">{r.details || <span className="italic text-slate-300 font-medium">No details provided</span>}</div>
                        {r.adminResponse && (
                          <div className="mt-2 bg-green-50/50 p-2.5 rounded-xl border border-green-100/50 text-[11px] font-medium text-green-700">
                            <span className="font-black uppercase mr-2 text-[9px] opacity-60">Response:</span> {r.adminResponse}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-300 font-bold mt-1">
                          {new Date(r.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-6 min-w-[200px]">
                        <div className="text-slate-800 font-black text-sm">{r.reporterId?.name || 'Unknown'}</div>
                        <div className="text-slate-400 text-xs font-medium">{r.reporterId?.email || '—'}</div>
                        <div className="mt-1 text-[10px] font-bold text-blue-500 uppercase">{r.reporterId?.role}</div>
                    </td>
                    <td className="px-6 py-6">
                      <select 
                        className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border-none outline-none cursor-pointer transition-all ${STATUS_CHIPS[r.status] || ''}`}
                        value={r.status}
                        disabled={updating === r._id}
                        onChange={(e) => updateStatus(r._id, e.target.value)}
                      >
                        {STATUS_OPTS.map(opt => <option key={opt} value={opt} className="bg-white text-slate-900 font-bold uppercase">{opt}</option>)}
                      </select>
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          className="bg-slate-900 hover:bg-blue-600 text-white font-black py-2 px-4 rounded-xl text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-slate-200"
                          onClick={() => setModalData({ id: r._id, status: r.status, response: r.adminResponse || '' })}
                        >
                          Respond
                        </button>
                        <button
                          className="bg-white hover:bg-red-50 text-slate-300 hover:text-red-600 font-black py-2 px-3 rounded-xl text-[10px] uppercase tracking-widest transition-all border border-slate-100 hover:border-red-100 shadow-sm"
                          disabled={deleting === r._id}
                          onClick={() => deleteReport(r._id)}
                        >
                          {deleting === r._id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Response Modal */}
      {modalData && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 space-y-6 animate-in fade-in zoom-in duration-200">
            <div>
              <h3 className="text-xl font-black text-slate-900">Send Response</h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Updating Inquiry Status</p>
            </div>
            
            <form onSubmit={handleResponseSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTS.map(opt => (
                    <button
                      key={opt}
                      type="button"
                      className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        modalData.status === opt 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' 
                          : 'bg-slate-50 text-slate-500 border-slate-100 hover:bg-white hover:border-slate-200'
                      }`}
                      onClick={() => setModalData({ ...modalData, status: opt })}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Your Message</label>
                <textarea
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium focus:bg-white focus:border-blue-500 transition-all outline-none"
                  rows={4}
                  value={modalData.response}
                  onChange={(e) => setModalData({ ...modalData, response: e.target.value })}
                  placeholder="Explain the resolution or next steps..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all"
                  onClick={() => setModalData(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-blue-200 disabled:opacity-50"
                  disabled={updating}
                >
                  {updating ? 'Saving...' : 'Send Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
