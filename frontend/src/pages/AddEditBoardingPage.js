import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';
import authService from '../services/authService';

const AddEditBoardingPage = ({ onClose, editId }) => {
    const { id: paramId } = useParams();
    const navigate = useNavigate();
    
    const id = editId || paramId;
    const isAddMode = !id;

    const userData = authService.getCurrentUser();
    const { user } = userData || {};

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
        ownerEmail: '',
    });

    useEffect(() => {
        if (isAddMode && !formData.ownerId) {
            // Use the logged-in user's ID if available, otherwise fallback to a random ID
            const defaultOwnerId = user?.id || ("OWNER-" + Math.random().toString(36).substr(2, 6).toUpperCase());
            
            setFormData(prev => ({ 
                ...prev, 
                ownerId: defaultOwnerId,
                ownerName: user?.name || '',
                contactNumber: user?.phoneNumber || '',
                ownerEmail: user?.email || ''
            }));
        }
    }, [isAddMode, user, formData.ownerId]);

    const [facilities, setFacilities] = useState([]);
    const [mediaFiles, setMediaFiles] = useState(null);
    const [slipFile, setSlipFile] = useState(null);
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
                        ownerEmail: p.ownerEmail || '',
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

        try {
            if (isAddMode) {
                await api.post('/boardings/add', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            } else {
                await api.put(`/boardings/update/${id}`, submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            }
            
            if (onClose) {
                onClose();
            } else {
                navigate('/dashboard');
            }
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
        <div className="bg-white p-6 md:p-8 rounded-2xl w-full mx-auto max-w-5xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900">{isAddMode ? 'Add New Boarding Place' : 'Edit Boarding Details'}</h1>
                    <p className="text-sm font-medium text-slate-500 mt-1">Provide accurate details to attract the best tenants.</p>
                </div>
                <button 
                    type="button" 
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 hover:text-purple-800 transition-colors px-4 py-2 font-bold text-sm rounded-xl shadow-sm whitespace-nowrap"
                    onClick={() => alert('Pro Listing Packages function coming soon!')}
                >
                    ✨ Pro Listing Packages
                </button>
            </div>

            {error && (
                <div className="bg-red-50 text-red-600 font-semibold p-4 rounded-xl text-sm mb-6 border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Title */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Title *</label>
                        <input type="text" name="title" value={formData.title} onChange={handleChange} required 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                            placeholder="e.g. Spacious Luxury Room near SLIIT"
                        />
                    </div>

                    {/* Address */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Address *</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} required 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                            placeholder="Full address of the property"
                        />
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Price Per Month (LKR) *</label>
                        <input type="number" name="pricePerMonth" value={formData.pricePerMonth} onChange={handleChange} required min="0" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                            placeholder="25000"
                        />
                    </div>

                    {/* Distance from Uni */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Distance from Uni (km) *</label>
                        <input type="number" step="0.1" name="distanceFromUniversity" value={formData.distanceFromUniversity} onChange={handleChange} required min="0" 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                            placeholder="1.5"
                        />
                    </div>

                    {/* Room Type */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Room Type *</label>
                        <select name="roomType" value={formData.roomType} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                        >
                            <option value="Shared">Shared Room</option>
                            <option value="Single">Single Room</option>
                        </select>
                    </div>

                    {/* Target Gender */}
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Target Gender *</label>
                        <select name="genderType" value={formData.genderType} onChange={handleChange} required
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors"
                        >
                            <option value="Any">Any Gender</option>
                            <option value="Male">Male Students</option>
                            <option value="Female">Female Students</option>
                        </select>
                    </div>

                    {/* Owner Info Group */}
                    <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Owner Verification Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Owner Name *</label>
                                <input type="text" name="ownerName" value={formData.ownerName} readOnly 
                                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-xl cursor-not-allowed block p-3"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Contact Number *</label>
                                <input type="text" name="contactNumber" value={formData.contactNumber} readOnly 
                                    className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-xl cursor-not-allowed block p-3"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 block">Unique Owner ID *</label>
                                <input type="text" name="ownerId" value={formData.ownerId} onChange={handleChange} required readOnly 
                                    className="w-full bg-blue-50 border border-blue-100 text-blue-800 font-mono font-bold text-sm rounded-xl cursor-not-allowed block p-3"
                                />
                                <p className="text-xs text-blue-600 font-medium">Keep this ID safe! It is uniquely generated for your account.</p>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div className="col-span-1 md:col-span-2 space-y-2 mt-4 pt-6 border-t border-slate-100">
                        <label className="text-sm font-bold text-slate-700 block">Property Description *</label>
                        <textarea name="description" value={formData.description} onChange={handleChange} required rows="4"
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block p-3 transition-colors resize-none"
                            placeholder="Describe your property, rules, nearest landmarks, etc."
                        ></textarea>
                    </div>

                    {/* Facilities */}
                    <div className="col-span-1 md:col-span-2 space-y-3">
                        <label className="text-sm font-bold text-slate-700 block">Available Facilities</label>
                        <div className="flex flex-wrap gap-3">
                            {availableFacilities.map(f => (
                                <label key={f} className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-bold cursor-pointer transition-colors ${facilities.includes(f) ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                                    <input type="checkbox" checked={facilities.includes(f)} onChange={() => handleFacilityToggle(f)} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300" />
                                    {f}
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="col-span-1 md:col-span-2 mt-2">
                        <label className="flex items-center gap-3 p-4 border border-emerald-200 bg-emerald-50 rounded-xl cursor-pointer">
                            <input type="checkbox" name="availability" checked={formData.availability} onChange={handleChange} className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500 border-gray-300" />
                            <span className="font-bold text-emerald-800 text-sm">Property is Available for Rent Immediately</span>
                        </label>
                    </div>

                    {/* Payment Info */}
                    <div className="col-span-1 md:col-span-2 mt-4 pt-6 border-t border-slate-100">
                        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                            <h3 className="text-amber-800 font-extrabold text-lg mb-2">Listing Fee Validation</h3>
                            <p className="text-amber-700 text-sm mb-4 font-medium">Please deposit the listing fee of <strong>LKR 7,499.00</strong> to the following account:</p>
                            
                            <div className="bg-white/60 border border-amber-200/50 rounded-xl p-4 mb-4 font-mono text-sm text-amber-900 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div><span className="font-bold block text-xs uppercase text-amber-700/70">Account Holder</span> EasyStay Holdings</div>
                                <div><span className="font-bold block text-xs uppercase text-amber-700/70">Bank Name</span> BOC (Kollupitiya Branch)</div>
                                <div className="sm:col-span-2"><span className="font-bold block text-xs uppercase text-amber-700/70">Account Number</span> 876 543 210</div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-amber-900 block">Upload Deposit Slip * <span className="font-normal text-amber-700">(PDF or Image)</span></label>
                                <input type="file" name="slip" onChange={handleSlipChange} required={isAddMode} accept="image/*,.pdf" 
                                    className="w-full text-sm text-amber-800 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-amber-200/50 file:text-amber-800 hover:file:bg-amber-200 block border border-amber-200 rounded-xl p-1.5 bg-white/50 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Media Upload */}
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 block">Upload Property Photos/Videos</label>
                        <input type="file" multiple name="media" onChange={handleMediaChange} 
                             className="w-full text-sm text-slate-500 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 block border-2 border-dashed border-slate-200 rounded-2xl p-4 bg-slate-50 hover:border-blue-400 transition-colors cursor-pointer"
                        />
                        {!isAddMode && <p className="text-xs font-semibold text-slate-400 mt-1">Note: Uploading new files will replace existing ones.</p>}
                    </div>

                </div>

                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
                    <button type="button" onClick={() => onClose ? onClose() : navigate('/dashboard')} className="px-6 py-2.5 rounded-xl font-bold text-sm text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-8 py-2.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-600/20 disabled:opacity-50 transition-all flex items-center justify-center min-w-[140px]">
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Saving...
                            </span>
                        ) : 'Save Boarding'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AddEditBoardingPage;
