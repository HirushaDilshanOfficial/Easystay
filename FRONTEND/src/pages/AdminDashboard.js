import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus, CheckCircle, FileText, XCircle } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
    const [boardings, setBoardings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoardings = async () => {
        try {
            const res = await api.get('/boardings?adminView=true');
            setBoardings(res.data.data || []);
        } catch (err) {
            console.error('Error fetching boardings:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/boardings/approve/${id}`);
            alert('Boarding Approved Successfully!');
            fetchBoardings();
        } catch (err) {
            console.error('Error approving boarding:', err);
            alert('Failed to approve');
        }
    };

    useEffect(() => {
        fetchBoardings();
    }, []);

    const handleReject = async (id) => {
        if (window.confirm('Reject and Remove this listing?')) {
            try {
                await api.delete(`/boardings/delete/${id}`);
                fetchBoardings();
            } catch (err) {
                console.error('Error rejecting boarding:', err);
                alert('Failed to reject');
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to permanently delete this listing?')) {
            try {
                await api.delete(`/boardings/delete/${id}`);
                fetchBoardings(); // Refresh list
            } catch (err) {
                console.error('Error deleting boarding:', err);
                alert('Failed to delete');
            }
        }
    };

    const getFullImageUrl = (img) => {
        return img.startsWith('http') ? img : `http://localhost:5001/uploads/${img}`;
    };

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="admin-dashboard">
            <div className="dashboard-header">
                <h1>Manage Boardings</h1>
                <Link to="/add" className="btn-primary">
                    <Plus size={16} /> Add New Listing
                </Link>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Owner ID</th>
                            <th>Documents</th>
                            <th>Approval Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boardings.length > 0 ? (
                            boardings.map((boarding) => (
                                <tr key={boarding._id}>
                                    <td>
                                        <strong>{boarding.title}</strong>
                                        <div className="text-muted small">{boarding.ownerName} ({boarding.contactNumber})</div>
                                    </td>
                                    <td><code>{boarding.ownerId || 'N/A'}</code></td>
                                    <td>
                                        <div className="doc-links">
                                            {boarding.depositSlip && (
                                                <a href={getFullImageUrl(boarding.depositSlip)} target="_blank" rel="noopener noreferrer" className="slip-link" title="Deposit Slip">
                                                    <FileText size={14} /> Slip
                                                </a>
                                            )}
                                            {boarding.nicPhoto && (
                                                <a href={getFullImageUrl(boarding.nicPhoto)} target="_blank" rel="noopener noreferrer" className="slip-link nic" title="NIC ID">
                                                    <FileText size={14} /> NIC
                                                </a>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`status-badge ${boarding.isApproved ? 'available' : 'occupied'}`}>
                                            {boarding.isApproved ? 'Approved ✅' : 'Pending ⏳'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        {!boarding.isApproved && (
                                            <>
                                                <button onClick={() => handleApprove(boarding._id)} className="btn-icon approve-btn" title="Approve Listing">
                                                    <CheckCircle size={18} />
                                                </button>
                                                <button onClick={() => handleReject(boarding._id)} className="btn-icon reject-btn" title="Reject Listing">
                                                    <XCircle size={18} />
                                                </button>
                                            </>
                                        )}
                                        <Link to={`/edit/${boarding._id}`} className="btn-icon edit">
                                            <Edit size={16} />
                                        </Link>
                                        <button onClick={() => handleDelete(boarding._id)} className="btn-icon delete">
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="text-center">No boardings found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminDashboard;
