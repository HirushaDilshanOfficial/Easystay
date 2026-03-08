import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import AdminDashboard from './pages/AdminDashboard';
import AddEditBoardingPage from './pages/AddEditBoardingPage';
import BoardingDetailsPage from './pages/BoardingDetailsPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminDashboard />} />
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
