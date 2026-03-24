import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';

const BoardingCard = ({ boarding }) => {
    const imageUrl = boarding.images && boarding.images.length > 0
        ? (boarding.images[0].startsWith('http') ? boarding.images[0] : `http://localhost:5001/uploads/${boarding.images[0]}`)
        : 'https://via.placeholder.com/400x300?text=No+Image';

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 shrink-0">
                <img src={imageUrl} alt={boarding.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className={`absolute top-3 left-3 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full shadow-sm ${boarding.availability ? 'bg-emerald-500' : 'bg-red-500'}`}>
                    {boarding.availability ? 'Available' : 'Occupied'}
                </span>
            </div>
            
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-extrabold text-slate-900 text-lg mb-1 leading-tight line-clamp-1" title={boarding.title}>{boarding.title}</h3>
                <p className="flex items-start gap-1 text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">
                    <MapPin size={16} className="shrink-0 mt-0.5" /> 
                    <span>{boarding.address}</span>
                </p>
                
                <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 mb-4 pb-4 border-b border-slate-100">
                    <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{boarding.roomType} Room</span>
                    <span className="bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 hover:text-blue-600 transition-colors">{boarding.genderType}</span>
                </div>
                
                {boarding.facilities && boarding.facilities.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mb-4">
                        {boarding.facilities.slice(0, 3).map((fac, idx) => (
                            <span key={idx} className="text-[11px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md border border-blue-100/50">
                                {fac === 'Food' ? 'Meals' : fac}
                            </span>
                        ))}
                        {boarding.facilities.length > 3 && (
                            <span className="text-[11px] font-bold bg-slate-50 text-slate-500 px-2 py-1 rounded-md border border-slate-100">
                                +{boarding.facilities.length - 3}
                            </span>
                        )}
                    </div>
                )}
                
                <div className="mt-auto pt-2 flex items-center justify-between gap-3">
                    <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">Monthly</span>
                        <span className="text-blue-600 font-extrabold text-lg leading-none">
                            LKR {boarding.pricePerMonth.toLocaleString()}
                        </span>
                    </div>
                    <Link to={`/boarding/${boarding._id}`} className="bg-slate-900 hover:bg-blue-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors shadow-sm whitespace-nowrap">
                        Details
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default BoardingCard;
