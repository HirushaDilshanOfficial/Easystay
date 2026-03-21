import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './utils/theme';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import BoardingOwnerDashboard from './pages/BoardingOwnerDashboard';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import LoyaltyDemo from './pages/LoyaltyDemo';
import PaymentDemo from './pages/PaymentDemo';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ProtectedRoute.RoleBased
                  admin={<AdminDashboard />}
                  owner={<BoardingOwnerDashboard />}
                  fallback={<Dashboard />}
                />
              </ProtectedRoute>
            }
          />
          <Route path="/loyalty-demo" element={<LoyaltyDemo />} />
          <Route path="/payment-demo" element={<PaymentDemo />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
