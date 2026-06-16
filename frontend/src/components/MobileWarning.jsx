import React, { useState, useEffect } from 'react';
import './MobileWarning.css';

export default function MobileWarning() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      // Only show if it's a mobile screen AND the user hasn't dismissed it yet
      const isDismissed = localStorage.getItem('mobileWarningDismissed');
      setIsMobile(window.innerWidth <= 768 && !isDismissed);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('mobileWarningDismissed', 'true');
    setIsMobile(false);
  };

  if (!isMobile) return null;

  return (
    <div className="mobile-warning-overlay">
      <div className="mobile-warning-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
        <h2>Desktop Experience Recommended</h2>
        <p>This application features complex data tables, an admin dashboard, and a detailed flight matrix.</p>
        <p>For the best viewing experience, please open this site on a desktop or laptop device.</p>
        <button className="mobile-warning-btn" onClick={handleDismiss}>
          Continue Anyway
        </button>
      </div>
    </div>
  );
}
