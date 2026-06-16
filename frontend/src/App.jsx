import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Book from './pages/Book';
import Home from './pages/Home';
import Login from './pages/Login';
import MyBookings from './pages/MyBookings';
import Payment from './pages/Payment';
import Register from './pages/Register';
import GoogleCallback from './pages/GoogleCallback';
import ForgotPassword from './pages/ForgotPassword';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import MobileWarning from './components/MobileWarning';
import './styles/global.css';

import { useEffect } from 'react';
import { authAPI, flightAPI, bookingAPI, notificationAPI } from './api/axios';

export default function App() {
  useEffect(() => {
    // Ping all services on initial load to wake them up from Render free tier sleep
    Promise.allSettled([
      authAPI.get('/health'),
      flightAPI.get('/health'),
      bookingAPI.get('/health'),
      notificationAPI.get('/health')
    ]);
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app">
            <MobileWarning />
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route
                  path="/book/round"
                  element={
                    <ProtectedRoute>
                      <Book />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/book/:flightId"
                  element={
                    <ProtectedRoute>
                      <Book />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings/:bookingId/pay"
                  element={
                    <ProtectedRoute>
                      <Payment />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bookings"
                  element={
                    <ProtectedRoute>
                      <MyBookings />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
