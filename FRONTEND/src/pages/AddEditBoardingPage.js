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
        ownerId: '',
    });

    useEffect(() => {
        if (isAddMode && !formData.ownerId) {
            const randomId = "OWNER-" + Math.random().toString(36).substr(2, 6).toUpperCase();
            setFormData(prev => ({ ...prev, ownerId: randomId }));
        }
    }, [isAddMode]);

    const [facilities, setFacilities] = useState([]);
    const [mediaFiles, setMediaFiles] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
    const [nicFile, setNicFile] = useState(null);
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
                        ownerId: p.ownerId || '',
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

    const handleMediaChange = (e) => {
        setMediaFiles(e.target.files);
    };

    const handleSlipChange = (e) => {
        setSlipFile(e.target.files[0]);
    };

    const handleNicChange = (e) => {
        setNicFile(e.target.files[0]);
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
        // Append Media Files
        if (mediaFiles) {
            for (let i = 0; i < mediaFiles.length; i++) {
                submitData.append('media', mediaFiles[i]);
            }
        }
        // Append Slip File
        if (slipFile) {
            submitData.append('slip', slipFile);
        }
        // Append NIC File
        if (nicFile) {
            submitData.append('nic', nicFile);
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
                            <label>Owner Name * (Must exactly match NIC)</label>
                            <input type="text" name="ownerName" value={formData.ownerName} onChange={handleChange} required placeholder="As per NIC" />
                        </div>

                        <div className="form-group">
                            <label>Contact Number *</label>
                            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required />
                        </div>

                        <div className="form-group">
                            <label>Unique Owner ID * (Write this down!)</label>
                            <input type="text" name="ownerId" value={formData.ownerId} onChange={handleChange} required readOnly />
                            <small className="text-muted">Generated automatically for your safety.</small>
                        </div>

                        <div className="form-group">
                            <label>Upload NIC Photo * (Proof of Identity)</label>
                            <input type="file" name="nic" onChange={handleNicChange} required={isAddMode} accept="image/*" />
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

                        <div className="form-group full-width bank-info-box">
                            <p>Please deposit the listing fee to the following account:</p>
                            <div className="bank-details-card">
                                <div><strong>Account Holder:</strong> EasyStay</div>
                                <div><strong>Bank:</strong> BOC Kollupitiya branch</div>
                                <div><strong>Account Num:</strong> 876543</div>
                            </div>
                            <p className="payment-note">Note: <strong>7499/per ad</strong> need to pay twice a month until boarding filled.</p>
                        </div>

                        <div className="form-group">
                            <label>Deposit Slip * (PDF/Image)</label>
                            <input type="file" name="slip" onChange={handleSlipChange} required={isAddMode} accept="image/*,.pdf" />
                            <small className="payment-note" style={{ display: 'block', marginTop: '5px' }}>Fee: <strong>7499 LKR</strong> per ad.</small>
                        </div>

                        <div className="form-group full-width">
                            <label>Upload Property Photos/Videos</label>
                            <input type="file" multiple name="media" onChange={handleMediaChange} />
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
