import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { sendOtp, verifyOtp, resetPassword } from '../api/auth';
import { useToast } from '../context/ToastContext';
import { extractApiError } from '../utils/formatters';

const STEPS = { EMAIL: 'email', OTP: 'otp', RESET: 'reset' };

export default function ForgotPassword() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otpId, setOtpId] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await sendOtp(email);
      setOtpId(response.data.otpId);
      setStep(STEPS.OTP);
      showToast('OTP sent to your email', 'success');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await verifyOtp({ otpId, otp });
      setResetToken(response.data.resetToken);
      setStep(STEPS.RESET);
      showToast('OTP verified', 'success');
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ resetToken, newPassword });
      showToast('Password reset successfully! Please login.', 'success');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(extractApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page auth-page">
      <div className="auth-card card">
        <h1>Reset password</h1>

        {/* Step indicator */}
        <div className="reset-steps">
          <span className={`reset-step ${step === STEPS.EMAIL ? 'active' : step !== STEPS.EMAIL ? 'done' : ''}`}>
            1. Email
          </span>
          <span className="reset-step-divider">→</span>
          <span className={`reset-step ${step === STEPS.OTP ? 'active' : step === STEPS.RESET ? 'done' : ''}`}>
            2. OTP
          </span>
          <span className="reset-step-divider">→</span>
          <span className={`reset-step ${step === STEPS.RESET ? 'active' : ''}`}>
            3. New password
          </span>
        </div>

        {/* Step 1: Email */}
        {step === STEPS.EMAIL && (
          <form onSubmit={handleSendOtp} className="auth-form">
            <p className="auth-subtitle">Enter your email to receive a one-time password.</p>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Step 2: OTP verification */}
        {step === STEPS.OTP && (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <p className="auth-subtitle">
              We sent a 6-digit OTP to <strong>{email}</strong>. Check your inbox.
            </p>
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
                placeholder="123456"
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={() => { setStep(STEPS.EMAIL); setError(''); setOtp(''); }}
            >
              Use a different email
            </button>
          </form>
        )}

        {/* Step 3: New password */}
        {step === STEPS.RESET && (
          <form onSubmit={handleResetPassword} className="auth-form">
            <p className="auth-subtitle">Choose a new password for your account.</p>
            <div className="form-group">
              <label htmlFor="newPassword">New password</label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </div>
            {error && <p className="form-error">{error}</p>}
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          Remember your password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
}
