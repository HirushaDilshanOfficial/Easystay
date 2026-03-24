import React from 'react';
import { PhoneCall, MessageCircle, Mail, MapPin } from 'lucide-react';

const ContactPage = () => {
    return (
        <div className="contact-page relative-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Soft decorative background circles */}
            <div className="bg-blob blob-1" style={{ background: 'rgba(59, 130, 246, 0.1)' }}></div>
            <div className="bg-blob blob-2" style={{ top: '60%', right: '-100px' }}></div>

            <header className="page-hero contact-hero animate-up">
                <div className="hero-content">
                    <span className="badge">Need Help?</span>
                    <h1>We're here for you</h1>
                    <p>Contact our team 24/7 to find your perfect stay or get help listing your property.</p>
                </div>
            </header>

            <main className="info-container">
                <div className="contact-premium-grid">
                    <div className="contact-left">
                        <section className="contact-card-v2 primary-bg text-white animate-up delay-1 tilt-card">
                            <h3>Hotline Support</h3>
                            <a href="tel:+94112345678" className="hotline-link">
                                <PhoneCall size={48} className="float-slow" />
                                <div className="hotline-info">
                                    <span className="number">+94 11 234 5678</span>
                                    <span className="sub">Call Now (24/7 Available)</span>
                                </div>
                            </a>
                            <p className="mt-4 opacity-80 small">Most queries are resolved in 15 minutes of calling.</p>
                        </section>

                        <section className="contact-card-v2 green-bg text-white mt-4 animate-up delay-2 tilt-card">
                            <h3>Chat Support</h3>
                            <a href="https://wa.me/94112345678" target="_blank" rel="noopener noreferrer" className="hotline-link">
                                <MessageCircle size={48} className="float-slow" />
                                <div className="hotline-info">
                                    <span className="number">WhatsApp Chat</span>
                                    <span className="sub">Fastest way to get help</span>
                                </div>
                            </a>
                        </section>

                        <section className="owner-box mt-4 animate-up delay-3 tilt-card">
                            <h2>Attention Owners!</h2>
                            <p>Stuck at the form? Don't worry, just call the hotline above and give us your property details. <strong>We will set up your listing for you!</strong></p>
                            <div className="list-item"><ShieldCheck size={18} /> Same day listing</div>
                            <div className="list-item"><ShieldCheck size={18} /> Expert description writing</div>
                            <div className="list-item"><ShieldCheck size={18} /> Professional ad layout</div>
                        </section>
                    </div>

                    <div className="contact-right animate-up delay-4">
                        <div className="card-plain shadow-lg tilt-card">
                            <h2>Send an Inquiry</h2>
                            <form className="contact-form-v2" onSubmit={(e) => { e.preventDefault(); alert('We received your message!'); e.target.reset(); }}>
                                <div className="input-field">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your Name" required />
                                </div>
                                <div className="input-field">
                                    <label>email</label>
                                    <input type="email" placeholder="example@gmail.com" required />
                                </div>
                                <div className="input-field">
                                    <label>Message Type</label>
                                    <select required>
                                        <option value="stu">I am a student</option>
                                        <option value="ow">I am an owner</option>
                                        <option value="other">General Question</option>
                                    </select>
                                </div>
                                <div className="input-field">
                                    <label>Your Message</label>
                                    <textarea rows="5" placeholder="How can we help?" required></textarea>
                                </div>
                                <button type="submit" className="btn-add-boarding w-full center">Send Now</button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

// Internal reusable components just for this page
const ShieldCheck = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>
);

export default ContactPage;
