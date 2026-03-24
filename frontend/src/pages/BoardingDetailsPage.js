import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Phone, User, CheckCircle, ArrowLeft, Calendar, Clock, Image as ImageIcon } from 'lucide-react';
import api from '../api';

const BoardingDetailsPage = () => {
    const { id } = useParams();
    const [boarding, setBoarding] = useState(null);
    const [loading, setLoading] = useState(true);
    const [mainImage, setMainImage] = useState('');

    useEffect(() => {
        const fetchBoarding = async () => {
            try {
                const res = await api.get(`/boardings/${id}`);
                setBoarding(res.data.data);
            } catch (err) {
                console.error('Error fetching boarding details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBoarding();
    }, [id]);

    useEffect(() => {
        if (boarding && boarding.images && boarding.images.length > 0) {
            setMainImage(boarding.images[0]);
        }
    }, [boarding]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-slate-500 font-medium animate-pulse">Loading property details...</p>
                </div>
            </div>
        );
    }

    if (!boarding) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 max-w-md w-full text-center">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <MapPin size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Property Not Found</h2>
                    <p className="text-slate-500 mb-8">The boarding you're looking for doesn't exist or has been removed.</p>
                    <Link to="/" className="inline-flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3.5 px-6 rounded-xl hover:bg-slate-800 transition-colors w-full">
                        <ArrowLeft size={18} /> Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const getFullImageUrl = (img) => {
        return img.startsWith('http') ? img : `http://localhost:5001/uploads/${img}`;
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Navigation Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm shadow-slate-200/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors bg-slate-50 hover:bg-blue-50 px-4 py-2 rounded-xl">
                        <ArrowLeft size={16} /> Back to Listings
                    </Link>
                    <div className="font-extrabold text-slate-800 hidden sm:block">EasyStay Properties</div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
                {/* Header Title & Location */}
                <div className="mb-8">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide flex items-center gap-1.5 shadow-sm ${boarding.availability ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${boarding.availability ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                                    {boarding.availability ? 'Available to Rent' : 'Currently Occupied'}
                                </span>
                                <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold shadow-sm">
                                    {boarding.roomType} Room
                                </span>
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-2">
                                {boarding.title}
                            </h1>
                            <p className="flex items-center gap-1.5 text-slate-500 text-base sm:text-lg font-medium">
                                <MapPin size={18} className="text-blue-500" /> {boarding.address}
                            </p>
                        </div>
                        <div className="text-left md:text-right shrink-0">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Monthly Rent</p>
                            <p className="text-4xl font-black text-blue-600 leading-none">
                                LKR {boarding.pricePerMonth.toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Main Content */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Image Gallery */}
                        <div className="bg-white rounded-3xl p-2 sm:p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <div className="relative aspect-[4/3] sm:aspect-video rounded-2xl overflow-hidden bg-slate-100 mb-4 group">
                                {mainImage ? (
                                    <img 
                                        src={getFullImageUrl(mainImage)} 
                                        alt={boarding.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                        <ImageIcon size={64} className="mb-4 opacity-50" />
                                        <p className="font-medium">No Images Available</p>
                                    </div>
                                )}
                            </div>
                            
                            {boarding.images && boarding.images.length > 1 && (
                                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2 sm:gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                    {boarding.images.map((img, index) => (
                                        <div 
                                            key={index} 
                                            className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition-all duration-200 border-2 shrink-0 ${mainImage === img ? 'border-blue-500 shadow-md transform scale-95' : 'border-transparent hover:opacity-80'}`}
                                            onClick={() => setMainImage(img)}
                                        >
                                            <img src={getFullImageUrl(img)} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Description Section */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                            <h2 className="text-xl font-black text-slate-900 mb-4">About the Property</h2>
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg">
                                {boarding.description || 'No description provided by the owner.'}
                            </p>
                        </div>

                        {/* Facilities Section */}
                        {boarding.facilities && boarding.facilities.length > 0 && (
                            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-black text-slate-900 mb-6">Amenities & Facilities</h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-6">
                                    {boarding.facilities.map((facility, index) => (
                                        <div key={index} className="flex items-center gap-3 bg-slate-50 px-4 py-3 rounded-2xl border border-slate-100">
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                                                <CheckCircle size={16} strokeWidth={3} />
                                            </div>
                                            <span className="font-bold text-slate-700">{facility}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar */}
                    <div className="space-y-6">
                        {/* Key Info Card */}
                        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                            <h3 className="text-lg font-black text-slate-900 mb-6 pb-4 border-b border-slate-100">Quick Information</h3>
                            <ul className="space-y-5">
                                <li className="flex justify-between items-center group">
                                    <span className="text-slate-500 font-medium">Room Type</span>
                                    <span className="font-extrabold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">{boarding.roomType || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between items-center group">
                                    <span className="text-slate-500 font-medium">Suitable For</span>
                                    <span className="font-extrabold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">{boarding.genderType || 'N/A'}</span>
                                </li>
                                <li className="flex justify-between items-center group">
                                    <span className="text-slate-500 font-medium">Distance from Uni</span>
                                    <span className="font-extrabold text-slate-800 bg-slate-50 px-3 py-1 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-700 transition-colors">{boarding.distanceFromUniversity ? `${boarding.distanceFromUniversity} km` : 'N/A'}</span>
                                </li>
                            </ul>
                        </div>

                        {/* Booking Widget */}
                        <div className="sticky top-24">
                            <AppointmentBooking boardingId={boarding._id} ownerName={boarding.ownerName} ownerPhone={boarding.contactNumber} />
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Minimal CSS for custom scrollbar */}
            <style dangerouslySetInnerHTML={{__html: `
                .custom-scrollbar::-webkit-scrollbar {
                    height: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1; 
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8; 
                }
            `}} />
        </div>
    );
};

const AppointmentBooking = ({ boardingId, ownerName, ownerPhone }) => {
    const [bookingMode, setBookingMode] = useState(false);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);
    const [userData, setUserData] = useState({ name: '', email: '', phone: '' });
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const user = storedUser?.user;

    useEffect(() => {
        if (user) {
            setUserData({
                name: user.name || '',
                email: user.email || '',
                phone: user.phoneNumber || ''
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchSlots = useCallback(async () => {
        setLoadingSlots(true);
        setSelectedSlot(''); // Reset selected slot when date changes
        try {
            const res = await api.get(`/appointments/available/${boardingId}/${date}`);
            setSlots(res.data.data);
        } catch (err) {
            console.error('Error fetching slots:', err);
        } finally {
            setLoadingSlots(false);
        }
    }, [boardingId, date]);

    useEffect(() => {
        if (bookingMode && date) {
            fetchSlots();
        }
    }, [bookingMode, date, fetchSlots]);

    const handleBooking = async (e) => {
        e.preventDefault();
        try {
            await api.post('/appointments/book', {
                boardingId,
                date,
                timeSlot: selectedSlot,
                userName: userData.name,
                userEmail: userData.email,
                userPhone: userData.phone
            });
            setBookingSuccess(true);
        } catch (err) {
            alert(err.response?.data?.message || 'Booking failed. The slot may have been taken.');
            fetchSlots(); // Refresh slots if it failed
        }
    };

    if (bookingSuccess) {
        return (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-3xl p-8 text-white shadow-xl shadow-emerald-200">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-6 border-2 border-white/40">
                    <CheckCircle size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Visit Scheduled!</h3>
                <p className="text-emerald-50 text-base mb-6 opacity-90">
                    Your appointment is confirmed for <br />
                    <strong className="text-white text-lg bg-white/10 px-3 py-1 rounded-lg inline-block mt-2">
                        {date} at {selectedSlot}
                    </strong>
                </p>
                
                <div className="bg-white/10 rounded-2xl p-5 border border-white/20 backdrop-blur-sm">
                    <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-100 mb-3 text-center border-b border-white/20 pb-2">Owner Contact Info</h4>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"><User size={14} /></div>
                            <span className="font-bold">{ownerName || 'Property Owner'}</span>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 px-4 py-2.5 rounded-xl">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0"><Phone size={14} /></div>
                            <span className="font-bold">{ownerPhone || 'Not Provided'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-slate-700">
                <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/10">
                        <User size={24} className="text-blue-400" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 leading-tight">Login Required</h3>
                    <p className="text-slate-400 font-medium mb-8 leading-relaxed text-sm sm:text-base">
                        You need to be logged in to schedule a visit for this property.
                    </p>
                    <Link 
                        to="/login"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-xl flex items-center justify-center gap-2 border border-blue-500"
                    >
                        Login to Continue
                    </Link>
                </div>
            </div>
        );
    }

    if (bookingMode) {
        return (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 border border-slate-100">
                <button 
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-800 font-bold text-sm mb-6 transition-colors" 
                    onClick={() => setBookingMode(false)}
                >
                    <ArrowLeft size={16} /> Cancel Booking
                </button>
                
                <h3 className="text-xl font-black text-slate-900 mb-6">Schedule a Visit</h3>
                
                <div className="mb-6">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Select Date</label>
                    <div className="relative">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500 pointer-events-none" size={18} />
                        <input 
                            type="date" 
                            value={date} 
                            min={new Date().toISOString().split('T')[0]} 
                            onChange={(e) => setDate(e.target.value)} 
                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 block pl-12 p-3.5 transition-all font-bold cursor-pointer"
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">Available Time Slots</label>
                    {loadingSlots ? (
                        <div className="flex justify-center py-8">
                            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin"></div>
                        </div>
                    ) : slots.length === 0 ? (
                        <div className="text-center py-6 bg-slate-50 rounded-2xl border border-slate-100 border-dashed">
                            <p className="text-slate-500 text-sm font-medium">No slots found for this date.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-3 gap-2 sm:gap-3">
                            {slots.map(slot => (
                                <button 
                                    key={slot.time}
                                    disabled={slot.isBooked}
                                    onClick={() => setSelectedSlot(slot.time)}
                                    className={`
                                        py-2.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 border flex items-center justify-center gap-1.5
                                        ${slot.isBooked 
                                            ? 'bg-slate-100 text-slate-400 border-transparent cursor-not-allowed opacity-60' 
                                            : selectedSlot === slot.time 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md transform scale-105 shadow-blue-500/20' 
                                                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700'}
                                    `}
                                    title={slot.isBooked ? 'Slot unavailable' : 'Click to select'}
                                >
                                    <Clock size={12} className={selectedSlot === slot.time ? 'text-white' : 'text-current'} /> 
                                    {slot.time}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {selectedSlot && (
                    <form onSubmit={handleBooking} className="space-y-4 animate-[fadeIn_0.3s_ease-out]">
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-sm font-black text-slate-800 mb-4">Your Information</h4>
                            <div className="space-y-3">
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Full Name" required readOnly value={userData.name} className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-2xl block pl-11 p-3.5 transition-all font-medium cursor-not-allowed" />
                                </div>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">@</span>
                                    <input type="email" placeholder="Email Address" required readOnly value={userData.email} className="w-full bg-slate-100 border border-slate-200 text-slate-500 text-sm rounded-2xl block pl-11 p-3.5 transition-all font-medium cursor-not-allowed" />
                                </div>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                    <input type="text" placeholder="Phone Number" required value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 block pl-11 p-3.5 transition-all font-medium" />
                                </div>
                            </div>
                        </div>
                        
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-4 shadow-sm border border-blue-500">
                            Confirm Appointment 🚀
                        </button>
                    </form>
                )}
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-blue-900/20 relative overflow-hidden">
            {/* Background embellishments */}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-indigo-900/30 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm border border-white/20">
                    {user ? <Calendar size={24} className="text-white" /> : <User size={24} className="text-white" />}
                </div>
                <h3 className="text-2xl font-black mb-3 leading-tight text-white shadow-sm">
                    {user ? 'Interested in this property?' : 'Login to Book a Visit'}
                </h3>
                <p className="text-blue-100 font-medium mb-8 leading-relaxed opacity-90 text-sm sm:text-base">
                    {user 
                        ? 'Book a physical visit to see the place in person. Inspect the facilities and directly connect with the property owner.'
                        : 'You need to be logged in to schedule a visit and view the owner\'s contact details.'}
                </p>
                {user ? (
                    <button 
                        className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border border-blue-100" 
                        onClick={() => setBookingMode(true)}
                    >
                        <Calendar size={18} /> Schedule a Visit
                    </button>
                ) : (
                    <Link 
                        to="/login"
                        className="w-full bg-white text-blue-700 hover:bg-blue-50 font-black py-4 px-6 rounded-2xl transition-all transform active:scale-95 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 border border-blue-100" 
                    >
                        <User size={18} /> Login to Continue
                    </Link>
                )}
            </div>
        </div>
    );
};

export default BoardingDetailsPage;
