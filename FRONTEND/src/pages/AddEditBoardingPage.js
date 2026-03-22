import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

const AddEditBoardingPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isAddMode = !id;

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        distanceFromUniversity: '',
        pricePerMonth: '',
        roomType: 'Shared',
        genderType: 'Any',
        availability: true,
        contactNumber: '',
        ownerName: '',
        bankName: '',
        accountNumber: '',
        depositAmount: '',
    });

    const [facilities, setFacilities] = useState([]);
    const [files, setFiles] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const availableFacilities = ["WiFi", "AC", "Food", "Parking", "CCTV", "Laundry", "Water"];

    useEffect(() => {
        if (!isAddMode) {
            const fetchBoarding = async () => {
                try {
                    const res = await api.get(`/boardings/${id}`);
                    const p = res.data.data;
                    setFormData({
                        title: p.title,
                        description: p.description,
                        address: p.address,
                        distanceFromUniversity: p.distanceFromUniversity,
                        pricePerMonth: p.pricePerMonth,
                        roomType: p.roomType,
                        genderType: p.genderType,
                        availability: p.availability,
                        contactNumber: p.contactNumber || '',
                        ownerName: p.ownerName || '',
                        bankName: p.bankName || '',
                        accountNumber: p.accountNumber || '',
                        depositAmount: p.depositAmount || '',
                    });
                    setFacilities(p.facilities || []);
                } catch (err) {
                    setError('Failed to fetch boarding details.');
                    console.error(err);
                }
            };
            fetchBoarding();
        }
    }, [id, isAddMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleFacilityToggle = (facility) => {
        if (facilities.includes(facility)) {
            setFacilities(facilities.filter(f => f !== facility));
        } else {
            setFacilities([...facilities, facility]);
        }
    };

    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const submitData = new FormData();
        // Append standard fields
        Object.keys(formData).forEach(key => {
            submitData.append(key, formData[key]);
        });
        // Append array
        facilities.forEach(f => submitData.append('facilities', f));
        // Append files
        if (files) {
            for (let i = 0; i < files.length; i++) {
                submitData.append('media', files[i]);
            }
        }

        try {
            if (isAddMode) {
                await api.post('/boardings/add', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.put(`/boardings/update/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            navigate('/admin');
        } catch (err) {
            console.error('Submit error:', err);
            let errorMsg = err.response?.data?.message || err.response?.data?.error;
            if (!errorMsg) {
                errorMsg = err.message === 'Network Error'
                    ? 'Network Error: Is the backend server running?'
                    : 'Something went wrong while saving.';
            }
            setError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page">
            <div className="form-container">
                <div className="form-header-flex">
                    <h1>{isAddMode ? 'Add New Boarding' : 'Edit Boarding'}</h1>
                    <button 
                        type="button" 
                        className="btn-pro-listing"
                        onClick={() => alert('Pro Listing Packages function coming soon!')}
                    >
                        Pro Listing Packages Click Here
                    </button>
                </div>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit} encType="multipart/form-data">
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Title *</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required />
                        </div>

                        <div className="form-group full-width">
                            <label>Address *</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Price Per Month (Rs) *</label>
                            <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} required min="0" />
                        </div>

                        <div className="form-group">
                            <label>Distance from Uni (km) *</label>
                            <input type="number" step="0.1" name="distanceFromUniversity" value={formData.distanceFromUniversity} onChange={handleChange} required min="0" />
                        </div>

                        <div className="form-group">
                            <label>Room Type *</label>
                            <select name="roomType" value={formData.roomType} onChange={handleChange} required>
                                <option value="Shared">Shared</option>
                                <option value="Single">Single</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Target Gender *</label>
                            <select name="genderType" value={formData.genderType} onChange={handleChange} required>
                                <option value="Any">Any</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Owner Name</label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} />
                        </div>

                        <div className="form-group">
                            <label>Contact Number</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} />
                        </div>

                        <div className="form-group full-width">
                            <label>Description *</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"></textarea>
                        </div>

                        <div className="form-group full-width">
                            <label>Facilities</label>
                            <div className="facilities-checkboxes">
                                {availableFacilities.map(f => (
                                    <label key={f} className="checkbox-label">
                                        <input type="checkbox" checked={facilities.includes(f)} onChange={() => handleFacilityToggle(f)} />
                                        {f}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="form-group full-width checkbox-row">
                            <label>
                                <input type="checkbox" name="availability" checked={formData.availability} onChange={handleChange} />
                                Is Available Now?
                            </label>
                        </div>

                        <div className="form-group full-width section-title">
                            <h3>Payment Details (For Deposit)</h3>
                        </div>

                        <div className="form-group">
                            <label>Bank Name *</label>
                            <input type="text" name="bankName" value={formData.bankName} onChange={handleChange} required={isAddMode} placeholder="e.g. Bank of Ceylon" />
                        </div>

                        <div className="form-group">
                            <label>Account Number *</label>
                            <input type="text" name="accountNumber" value={formData.accountNumber} onChange={handleChange} required={isAddMode} />
                        </div>

                        <div className="form-group">
                            <label>Deposit Amount to Pay (LKR) *</label>
                            <input type="number" name="depositAmount" value={formData.depositAmount} onChange={handleChange} required={isAddMode} min="0" />
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Deposit Slip & Property Images/Videos (First file MUST be the Deposit Slip) *</label>
                            <input type="file" multiple name="media" onChange={handleFileChange} required={isAddMode} />
                            <small className="text-info" style={{ display: 'block', marginBottom: '10px' }}>Important: The very first file you select will be used as the proof of payment.</small>
                            {!isAddMode && <small className="text-muted block">Note: Uploading new files will replace existing ones.</small>}
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={() => navigate('/admin')} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={loading} className="btn-primary">
                            {loading ? 'Saving...' : 'Save Boarding'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEditBoardingPage;
