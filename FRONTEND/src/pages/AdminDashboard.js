import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit, Trash2, Plus } from 'lucide-react';
import api from '../api';

const AdminDashboard = () => {
    const [boardings, setBoardings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBoardings = async () => {
        try {
            const res = await api.get('/boardings');
            setBoardings(res.data.data || []);
        } catch (err) {
            console.error('Error fetching boardings:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBoardings();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this listing?')) {
            try {
                await api.delete(`/boardings/delete/${id}`);
                fetchBoardings(); // Refresh list
            } catch (err) {
                console.error('Error deleting boarding:', err);
                alert('Failed to delete');
            }
        }
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
                            <th>Price/Mo</th>
                            <th>Type</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {boardings.length > 0 ? (
                            boardings.map((boarding) => (
                                <tr key={boarding._id}>
                                    <td>{boarding.title}</td>
                                    <td>Rs. {boarding.pricePerMonth}</td>
                                    <td>{boarding.roomType}</td>
                                    <td>
                                        <span className={`status-badge ${boarding.availability ? 'available' : 'occupied'}`}>
                                            {boarding.availability ? 'Available' : 'Occupied'}
                                        </span>
                                    </td>
                                    <td className="actions">
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
