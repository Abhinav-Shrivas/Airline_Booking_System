import { useCallback, useEffect, useRef } from 'react';
import { getGoogleAuthUrl } from '../api/auth';
import { useAuth } from './useAuth';
import { useToast } from '../context/ToastContext';

/**
 * Hook that opens Google OAuth in a centered popup window
 * and listens for the auth response via postMessage.
 */
export function useGooglePopup() {
  const { applyAuthResponse } = useAuth();
  const { showToast } = useToast();
  const popupRef = useRef(null);

  useEffect(() => {
    function handleMessage(event) {
      // Only accept messages from our own origin
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'GOOGLE_AUTH_SUCCESS') return;

      const { accessToken, email } = event.data;
      if (accessToken) {
        applyAuthResponse({ accessToken, email }).then(() => {
          showToast('Logged in with Google!', 'success');
        });
      } else {
        showToast('Google login failed. Please try again.', 'error');
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [applyAuthResponse, showToast]);

  const openGooglePopup = useCallback(() => {
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;

    const features = `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`;

    // Close existing popup if open
    if (popupRef.current && !popupRef.current.closed) {
      popupRef.current.close();
    }

    popupRef.current = window.open(getGoogleAuthUrl(), 'google-auth', features);
  }, []);

  return { openGooglePopup };
}
