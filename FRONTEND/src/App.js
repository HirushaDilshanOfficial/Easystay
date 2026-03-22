import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AddEditBoardingPage from './pages/AddEditBoardingPage';
import BoardingDetailsPage from './pages/BoardingDetailsPage';
import OwnerDashboard from './pages/OwnerDashboard';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import './App.css';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="App" style={{ minHeight: '100vh', position: 'relative' }}>
        {/* 🌌 High-Performance Global Background */}
        <div className="particles-container"></div>
        <div className="bg-blob blob-1"></div>
        <div className="bg-blob blob-2" style={{ top: '30%', right: '-150px' }}></div>
        <div className="bg-blob blob-1" style={{ bottom: '-10%', left: '15%' }}></div>

        <Navbar />
        <main className="main-content" style={{ position: 'relative', zIndex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/owner" element={<OwnerDashboard />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/add" element={<AddEditBoardingPage />} />
            <Route path="/edit/:id" element={<AddEditBoardingPage />} />
            <Route path="/boarding/:id" element={<BoardingDetailsPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
