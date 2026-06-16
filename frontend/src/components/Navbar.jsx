import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

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
              <span className="nav-user">Hi, {user?.name}</span>
              <button type="button" className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
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
