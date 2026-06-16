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
import './styles/global.css';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <div className="app">
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
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
