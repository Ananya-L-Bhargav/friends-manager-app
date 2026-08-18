import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const { user, logout, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="app-container navbar-inner">
        <Link to="/dashboard" className="brand-logo">
          <div className="brand-icon-box">
            <Users size={20} strokeWidth={2.5} />
          </div>

          <div>
            <span>Friends Manager</span>
          </div>
        </Link>

        <div className="nav-actions">
          <button
            type="button"
            className="btn-icon"
            onClick={toggleTheme}
            title={
              theme === 'dark'
                ? 'Switch to Light Mode'
                : 'Switch to Dark Mode'
            }
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? (
              <Sun size={18} />
            ) : (
              <Moon size={18} />
            )}
          </button>

          {user && (
            <>
              <Link to="/friends/new" className="btn btn-primary btn-sm">
                <UserPlus size={16} />
                <span>Add Friend</span>
              </Link>

              <div
                className="user-badge"
                title={`Signed in as ${user.username}`}
              >
                <div className="user-avatar-mini">
                  {user.username.charAt(0).toUpperCase()}
                </div>

                <span>{user.username}</span>
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={handleLogout}
                title="Log out of session"
                aria-label="Log Out"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}