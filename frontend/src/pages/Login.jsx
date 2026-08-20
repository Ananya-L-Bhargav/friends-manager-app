import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, isAuthenticated, theme, toggleTheme } = useAuth();
  const navigate = useNavigate();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!username.trim()) {
      setErrorMessage('Please enter your username or email');
      return;
    }

    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);

    try {
      await login(username.trim(), password.trim());
      navigate('/dashboard');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = (u, p) => {
    setUsername(u);
    setPassword(p);
    setErrorMessage('');
  };

  return (
    <div className="auth-container">
      {/* Floating Theme Switcher */}
      <div className="auth-theme-toggle">
        <button
          type="button"
          className="btn-icon"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="glass-card auth-card">
        {/* Header with glowing icon */}
        <div className="auth-header">
          <div className="logo-large">
            <Users size={30} />
          </div>
          <h1 className="auth-title">Welcome to FriendsPulse</h1>
          <p className="auth-subtitle">
            Manage your network, track memories, and stay connected.
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose)',
              fontSize: '0.875rem',
              marginBottom: '20px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="login-username">
              Username or Email <span className="required-star">*</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <User size={18} />
              </span>
              <input
                id="login-username"
                type="text"
                className={`form-input has-left-icon ${errorMessage && !username ? 'input-error' : ''}`}
                placeholder="Enter username (e.g. ananya)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required-star">*</span>
            </label>
            <div className="input-container">
              <span className="input-icon">
                <Lock size={18} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className={`form-input has-left-icon has-right-icon ${errorMessage && !password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isLoading}
              />
              <button
                type="button"
                className="input-action-btn"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', marginTop: '8px', padding: '13px' }}
            disabled={isLoading}
            id="login-submit-btn"
          >
            {isLoading ? (
              <>
                <span className="spinner" />
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Demo Accounts Quick-Fill Box */}
        <div className="demo-account-box">
          <div className="demo-account-title">
            <span>Quick Demo Accounts</span>
            <Sparkles size={14} color="var(--accent-amber)" />
          </div>
          <div className="demo-chips">
            <button
              type="button"
              className="demo-chip-btn"
              onClick={() => handleDemoFill('ananya', '123456')}
            >
              ananya / 123456
            </button>
            <button
              type="button"
              className="demo-chip-btn"
              onClick={() => handleDemoFill('demo', 'demo123')}
            >
              demo / demo123
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
