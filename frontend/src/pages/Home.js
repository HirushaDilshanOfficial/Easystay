import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Search as SearchIcon,
    ArrowForward as ArrowIcon,
    Star as StarIcon,
    School as SchoolIcon,
    Apartment as ApartmentIcon,
    People as PeopleIcon,
    AttachMoney as MoneyIcon,
    CheckCircle as CheckIcon,
    Send as SendIcon,
    Speed as SpeedIcon,
    Wifi as WifiIcon,
    LocalDining as MealIcon,
    Security as SecurityIcon,
} from '@mui/icons-material';
import contactService from '../services/contactService';
import Navbar from '../components/Navbar';

const PROPERTIES = [
    { name: 'Skyline Pittugala', price: 'LKR 35k/mo', tag: 'Verified', tagColor: '#22c55e', rooms: 4, shared: false, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&auto=format&fit=crop&q=60' },
    { name: 'The Courtyard', price: 'LKR 42k/mo', tag: 'Popular', tagColor: '#3b82f6', rooms: 6, shared: true, image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=60' },
    { name: 'Zenith Heights', price: 'LKR 50k/mo', tag: 'New Listing', tagColor: '#8b5cf6', rooms: 2, shared: false, image: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=60' },
];

const TESTIMONIALS = [
    { name: 'Ahaan Silva', role: 'CS Student, SLIIT', text: 'The map view helped me find a place within walking distance of the lab complex. No more shuttle hassles!', avatar: 'AS' },
    { name: 'Priyanka Perera', role: 'Business Management', text: 'I love how easy it was to filter by amenities. Found a room with a study desk and high-speed fiber from my phone.', avatar: 'PP' },
    { name: 'Danesh K.', role: 'Software Engineering', text: 'The verified tag gives you peace of mind. What you see in the photos is exactly what you get when you visit.', avatar: 'DK' },
];

const FEATURES = [
    { icon: <WifiIcon />, label: 'High-speed Fiber' },
    { icon: <MealIcon />, label: 'Meals Included' },
    { icon: <SecurityIcon />, label: '24/7 Security' },
    { icon: <SpeedIcon />, label: 'Quick Approval' },
];

export default function Home() {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);
        try {
            await contactService.submitContactForm(formData);
            setSubmitStatus({ type: 'success', message: "Thanks! We'll get back to you very soon." });
            setFormData({ name: '', email: '', message: '' });
        } catch {
            setSubmitStatus({ type: 'error', message: 'Failed to send. Please try again.' });
        } finally {
            setIsSubmitting(false);
            setTimeout(() => setSubmitStatus(null), 6000);
        }
    };

    const fade = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
    const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };

    return (
        <div className="min-h-screen bg-white text-gray-800 font-sans overflow-x-hidden selection:bg-blue-100">

            <Navbar />

            {/* ──── HERO ──── */}
            <section
                className="relative min-h-[90vh] flex items-center overflow-hidden"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1631679706909-1844bbd07221?w=1800&auto=format&fit=crop&q=90')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            >
                {/* Very subtle left-side overlay so dark text reads clearly */}
                <div className="absolute inset-0 bg-gradient-to-r from-white/70 via-white/30 to-transparent pointer-events-none"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-10 lg:px-20 w-full py-16">
                    <div className="max-w-xl">
                        <motion.div variants={stagger} initial="hidden" animate="visible">

                            <motion.div variants={fade} className="inline-flex items-center gap-1.5 bg-blue-100/90 backdrop-blur-sm text-blue-700 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full mb-7">
                                <SchoolIcon sx={{ fontSize: 13 }} />
                                SLIIT Residency Excellence
                            </motion.div>

                            <motion.h1 variants={fade} className="text-5xl md:text-[3.6rem] font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-5">
                                The Future of<br />
                                <span className="text-blue-600">Student Living</span>
                            </motion.h1>

                            <motion.p variants={fade} className="text-base text-gray-700 leading-relaxed mb-10 font-medium max-w-md">
                                Discover a new standard of academic residency. Modern, verified, and strategically located boarding for the ambitious SLIIT community.
                            </motion.p>

                            {/* Search Bar */}
                            <motion.div variants={fade} className="flex items-center gap-2 bg-white/95 backdrop-blur-md rounded-2xl shadow-lg px-4 py-3 mb-8 w-full max-w-lg">
                                <SearchIcon sx={{ color: '#9ca3af', fontSize: 20 }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    placeholder="Search area, building..."
                                    className="flex-1 text-sm text-gray-700 placeholder-gray-400 outline-none bg-transparent font-medium"
                                />
                                <div className="flex items-center gap-1.5 border-l border-gray-200 pl-3 pr-2 cursor-pointer hover:text-blue-600 transition-colors">
                                    <ApartmentIcon sx={{ color: '#6b7280', fontSize: 17 }} />
                                    <span className="text-sm text-gray-500 font-semibold">Ty</span>
                                    <span className="text-gray-400 text-xs">▾</span>
                                </div>
                                <Link to="#" className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-5 py-2.5 rounded-xl shadow shadow-blue-500/20 transition-all whitespace-nowrap ml-1">
                                    Find Your Home
                                </Link>
                            </motion.div>

                            {/* Feature tags */}
                            <motion.div variants={fade} className="flex flex-wrap gap-3">
                                {FEATURES.map((f, i) => (
                                    <div key={i} className="flex items-center gap-1.5 bg-white/80 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm border border-white/60">
                                        <span className="text-blue-500">{f.icon}</span>
                                        {f.label}
                                    </div>
                                ))}
                            </motion.div>

                        </motion.div>
                    </div>

                    {/* Floating rating card — positioned bottom-right of content */}
                    <motion.div
                        animate={{ y: [0, -7, 0] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="absolute right-16 bottom-16 bg-white/95 backdrop-blur-md border border-white rounded-2xl shadow-2xl px-5 py-4 max-w-[220px] hidden md:block"
                    >
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <StarIcon sx={{ color: '#f59e0b', fontSize: 16 }} />
                            <span className="text-sm font-extrabold text-gray-900">4.9 Campus Rating</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-snug italic">"The proximity to the Engineering faculty is a game-changer for my morning labs."</p>
                    </motion.div>
                </div>
            </section>

            {/* ──── PROPERTIES ──── */}
            <section id="properties" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex items-end justify-between mb-10">
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2">Curated Residences</h2>
                            <p className="text-gray-500 font-medium text-sm">Every property is hand-verified by our wardens for safety and comfort standards.</p>
                        </div>
                        <Link to="#" className="hidden md:flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            View all properties <ArrowIcon fontSize="small" />
                        </Link>
                    </div>

                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
                        {PROPERTIES.map((p, i) => (
                            <motion.div key={i} variants={fade} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-100 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group">
                                <div className="relative aspect-video overflow-hidden">
                                    <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <span className="absolute top-3 left-3 text-[11px] font-extrabold text-white px-2.5 py-1 rounded-full" style={{ backgroundColor: p.tagColor }}>
                                        {p.tag}
                                    </span>
                                </div>
                                <div className="p-5">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <h3 className="font-extrabold text-gray-900 text-base">{p.name}</h3>
                                        <span className="text-blue-600 font-bold text-sm shrink-0">{p.price}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-gray-500 font-semibold mb-4">
                                        <span className="flex items-center gap-1"><ApartmentIcon sx={{ fontSize: 14 }} /> {p.rooms} Rooms</span>
                                        <span className="flex items-center gap-1"><PeopleIcon sx={{ fontSize: 14 }} /> {p.shared ? 'Shared' : 'Private'}</span>
                                    </div>
                                    <Link to="#" className="block w-full text-center bg-gray-50 hover:bg-blue-600 hover:text-white border border-gray-100 text-gray-700 text-sm font-bold py-2.5 rounded-xl transition-all duration-200">
                                        Details
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ──── TESTIMONIALS ──── */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <motion.p variants={fade} initial="hidden" whileInView="visible" viewport={{ once: true }}
                        className="text-2xl md:text-3xl font-bold text-gray-700 italic mb-14 max-w-2xl mx-auto leading-relaxed">
                        "From finding to moving in, the <span className="text-blue-600 not-italic font-extrabold">process was seamless.</span>"
                    </motion.p>
                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid md:grid-cols-3 gap-6">
                        {TESTIMONIALS.map((t, i) => (
                            <motion.div key={i} variants={fade} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-left">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-extrabold text-sm shrink-0">{t.avatar}</div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{t.name}</p>
                                        <p className="text-xs text-gray-400 font-medium">{t.role}</p>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{t.text}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ──── OWNER CTA ──── */}
            <section id="owners" className="py-20 bg-[#1e293b]">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center gap-12">
                    {/* Left */}
                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-1">
                        <motion.h2 variants={fade} className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
                            Host Your Property<br />To 10k+ Students
                        </motion.h2>
                        <motion.p variants={fade} className="text-slate-400 text-base font-medium mb-8 max-w-sm leading-relaxed">
                            Join the roster of landlords providing premium housing to SLIIT. Manage bookings, payments and student queries all in one dashboard.
                        </motion.p>
                        <motion.div variants={fade} className="flex gap-4">
                            <Link to="/signup" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all text-sm shadow-lg shadow-blue-600/20">
                                Start Listing
                            </Link>
                            <a href="#contact" className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/15 text-white font-bold rounded-xl transition-all text-sm border border-white/10">
                                Learn More
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right: Stats */}
                    <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="flex-none grid grid-cols-2 gap-5">
                        {[
                            { icon: <CheckIcon sx={{ color: '#3b82f6' }} />, value: '98%', label: 'Average Occupancy Rate' },
                            { icon: <MoneyIcon sx={{ color: '#22c55e' }} />, value: 'LKR 0', label: 'Platform Listing Fee' },
                            { icon: <SpeedIcon sx={{ color: '#f59e0b' }} />, value: 'Automated', label: 'Rent Collection & Invoicing' },
                            { icon: <PeopleIcon sx={{ color: '#8b5cf6' }} />, value: '10k+', label: 'Active Student Seekers' },
                        ].map((s, i) => (
                            <motion.div key={i} variants={fade} className="bg-white/5 border border-white/10 rounded-2xl p-5 text-white">
                                <div className="mb-2">{s.icon}</div>
                                <div className="text-2xl font-extrabold mb-1">{s.value}</div>
                                <div className="text-xs text-slate-400 font-semibold">{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ──── CONTACT ──── */}
            <section id="contact" className="py-20 bg-white">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="text-center mb-14">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-3">Contact Us</h2>
                        <p className="text-gray-500 max-w-md mx-auto">Have a question? Send us a message and we'll respond within 24 hours.</p>
                    </div>

                    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100 overflow-hidden flex flex-col md:flex-row">
                        <div className="md:w-2/5 bg-blue-600 p-10 flex flex-col justify-between">
                            <div>
                                <h3 className="text-2xl font-extrabold text-white mb-3">Get in Touch</h3>
                                <p className="text-blue-100 text-sm leading-relaxed mb-8">Whether you're a student or a landlord — we're here to help.</p>
                                <div className="space-y-5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><SendIcon sx={{ color: 'white', fontSize: 15 }} /></div>
                                        <span className="text-white text-sm font-medium">support.easystay@gmail.com</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center"><SchoolIcon sx={{ color: 'white', fontSize: 15 }} /></div>
                                        <span className="text-white text-sm font-medium">SLIIT Campus Area, Malabe</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-8">
                                {[1, 2, 3, 4].map(i => <div key={i} className="w-2.5 h-2.5 rounded-full bg-white/30"></div>)}
                            </div>
                        </div>
                        <div className="md:w-3/5 p-10">
                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                {submitStatus && (
                                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                                        className={`p-3.5 rounded-xl text-sm font-semibold ${submitStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                                        {submitStatus.message}
                                    </motion.div>
                                )}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <FormField label="Name" type="text" value={formData.name} onChange={v => setFormData({ ...formData, name: v })} placeholder="Alex Johnson" />
                                    <FormField label="Email" type="email" value={formData.email} onChange={v => setFormData({ ...formData, email: v })} placeholder="alex@my.sliit.lk" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">Message</label>
                                    <textarea required rows={5} value={formData.message} onChange={e => setFormData({ ...formData, message: e.target.value })}
                                        placeholder="How can we help you?"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all resize-none" />
                                </div>
                                <button type="submit" disabled={isSubmitting}
                                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold px-6 py-3.5 rounded-xl text-sm shadow shadow-blue-500/20 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2">
                                    {isSubmitting ? 'Sending...' : (<>Send Message <SendIcon fontSize="small" /></>)}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </section>

            {/* ──── FOOTER ──── */}
            <footer className="bg-gray-900 border-t border-gray-800 pt-14 pb-8">
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center"><ApartmentIcon sx={{ color: 'white', fontSize: 16 }} /></div>
                            <span className="font-extrabold text-white">EasyStay</span>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">Elevating the student living experience in Malabe with data-driven residency management.</p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Resources</h4>
                        <div className="space-y-2.5">
                            {['Campus Map', 'Shuttle Schedule', 'Housing Policy'].map(l => <a key={l} href="#" className="block text-gray-400 hover:text-white text-sm transition-colors">{l}</a>)}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Support</h4>
                        <div className="space-y-2.5">
                            {['Contact Warden', 'Helpdesk', 'Emergency'].map(l => <a key={l} href="#contact" className="block text-gray-400 hover:text-white text-sm transition-colors">{l}</a>)}
                        </div>
                    </div>
                    <div>
                        <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">Newsletter</h4>
                        <p className="text-gray-400 text-sm mb-4">Stay updated with new openings.</p>
                        <div className="flex gap-2">
                            <input type="email" placeholder="Email" className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors" />
                            <button className="w-10 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors shrink-0">
                                <ArrowIcon sx={{ color: 'white', fontSize: 18 }} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-6 border-t border-gray-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
                    <p className="text-gray-500 text-xs">&copy; {new Date().getFullYear()} EasyStay — SLIIT Student Residency Excellence</p>
                    <div className="flex gap-5 text-xs font-semibold text-gray-500">
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function FormField({ label, type, value, onChange, placeholder }) {
    return (
        <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">{label}</label>
            <input type={type} required value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all" />
        </div>
    );
}
