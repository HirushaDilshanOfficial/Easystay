import React from 'react';
import { Target, Users, ShieldCheck, Heart } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="about-page relative-container" style={{ position: 'relative', overflow: 'hidden' }}>
            {/* Decorative background blobs */}
            <div className="bg-blob blob-1"></div>
            <div className="bg-blob blob-2" style={{ top: '40%', right: '-50px' }}></div>
            <div className="bg-blob blob-1" style={{ bottom: '0', left: '20%' }}></div>

            <header className="page-hero animate-up">
                <div className="hero-content">
                    <span className="badge">Since 2024</span>
                    <h1>Redefining Student Living</h1>
                    <p>Easy Stay is more than a platform. It's a community dedicated to making university life stress-free and accessible for everyone.</p>
                </div>
            </header>

            <main className="info-container">
                <section className="values-grid">
                    <div className="value-card animate-up delay-1 tilt-card">
                        <div className="icon-box float-slow"><Target /></div>
                        <h3>Our Goal</h3>
                        <p>To digitize the boarding house search process in Sri Lanka, starting with student hubs like Malabe.</p>
                    </div>
                    <div className="value-card animate-up delay-2 tilt-card">
                        <div className="icon-box float-slow"><Users /></div>
                        <h3>For Everyone</h3>
                        <p>We serve thousands of students from SLIIT, CINEC, and Horizon, while helping local owners thrive.</p>
                    </div>
                    <div className="value-card animate-up delay-3 tilt-card">
                        <div className="icon-box float-slow"><ShieldCheck /></div>
                        <h3>Safety First</h3>
                        <p>Every listing and owner is manually verified by our team for your peace of mind.</p>
                    </div>
                    <div className="value-card animate-up delay-4 tilt-card">
                        <div className="icon-box float-slow"><Heart /></div>
                        <h3>Free to Use</h3>
                        <p>Students search for free. Owners pay a small listing fee to reach the right audience.</p>
                    </div>
                </section>

                <section className="story-section bg-gradient-dark">
                    <div className="story-content">
                        <h2>The Easy Stay Story</h2>
                        <p>Born out of the frustration of walking through hot streets just to find a "To Let" board, Easy Stay was created to bring every available room to your phone screen. We believe students should focus on their studies, not where they will sleep tonight.</p>
                        <div className="stats-row">
                            <div className="stat">
                                <span className="number">50+</span>
                                <span className="label">Boardings</span>
                            </div>
                            <div className="stat">
                                <span className="number">1000+</span>
                                <span className="label">Students</span>
                            </div>
                            <div className="stat">
                                <span className="number">100%</span>
                                <span className="label">Verified</span>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AboutPage;
