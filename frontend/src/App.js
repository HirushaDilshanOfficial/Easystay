import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import SubmitReview from './pages/SubmitReview';
import Ranking from './pages/Ranking';
import Analytics from './pages/Analytics';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <nav>
        <NavLink to="/" className="brand">🐾 EasyStay</NavLink>
        <NavLink to="/" end className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          🏠 Home
        </NavLink>
        <NavLink to="/submit" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          💬 Feedback
        </NavLink>
        <NavLink to="/ranking" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          🏆 Ranking
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>
          📊 Analytics
        </NavLink>
        <NavLink to="/admin" className={({ isActive }) => 'nav-link report-btn' + (isActive ? ' active' : '')}>
          🚨 Admin
        </NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/submit" element={<SubmitReview />} />
        <Route path="/ranking" element={<Ranking />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </Router>
  );
}

export default App;