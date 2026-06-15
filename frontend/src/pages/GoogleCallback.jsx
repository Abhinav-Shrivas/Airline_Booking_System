import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GoogleCallback() {
  const [searchParams] = useSearchParams();
  const { applyAuthResponse } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const processed = useRef(false);

  useEffect(() => {
    if (processed.current) return;
    processed.current = true;

    const accessToken = searchParams.get('accessToken');
    const email = searchParams.get('email');

    // If opened as popup, send data back to parent window and close
    if (window.opener) {
      window.opener.postMessage(
        { type: 'GOOGLE_AUTH_SUCCESS', accessToken, email },
        window.location.origin,
      );
      window.close();
      return;
    }

    // Fallback: if not a popup (e.g. direct navigation), handle normally
    if (accessToken) {
      applyAuthResponse({ accessToken, email }).then(() => {
        showToast('Logged in with Google!', 'success');
        navigate('/', { replace: true });
      });
    } else {
      showToast('Google login failed. Please try again.', 'error');
      navigate('/login', { replace: true });
    }
  }, [searchParams, applyAuthResponse, showToast, navigate]);

  return (
    <div className="page page-loading">
      <LoadingSpinner message="Completing Google login..." />
    </div>
  );
}
