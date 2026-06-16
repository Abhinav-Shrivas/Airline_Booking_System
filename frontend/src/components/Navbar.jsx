import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout, logoutFromOtherDevices } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✈</span>
          SkyBooker
        </Link>

        <div className="navbar-actions">
          {isAuthenticated ? (
            <>
              <Link to="/bookings" className="nav-link">
                My Bookings
              </Link>
              <Link to="/notifications" className="nav-link">
                Notifications
              </Link>
              {user?.roles?.includes('ADMIN') && (
                <Link to="/admin" className="nav-link" style={{ color: 'var(--color-warning)' }}>
                  Manage as Admin
                </Link>
              )}
              
              <div className="nav-user-dropdown-container" ref={dropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', marginLeft: '0.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '50%', border: '1px solid var(--color-border)', width: '40px', height: '40px' }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </button>
                
                {dropdownOpen && (
                  <div className="dropdown-menu" style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    minWidth: '200px',
                    zIndex: 50,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}>
                    <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-border)', fontWeight: '600', color: 'var(--color-text)' }}>
                      Hi, {user?.name}
                    </div>
                    <button 
                      type="button" 
                      onClick={() => { setDropdownOpen(false); handleLogout(); }}
                      style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--color-text)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-background)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Logout
                    </button>
                    <button 
                      type="button" 
                      onClick={async () => {
                        setDropdownOpen(false);
                        try {
                          await logoutFromOtherDevices();
                          alert('Logged out from all other devices successfully!');
                        } catch (err) {
                          alert('Failed to logout from other devices');
                        }
                      }}
                      style={{ padding: '0.75rem 1rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--color-error)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-background)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      Logout from other devices
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
