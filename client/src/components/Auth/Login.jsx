import React, { useState } from 'react';
import { Mail, Lock, Zap, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Login({ onSwitchToRegister }) {
  const { login, demoLogin } = useAuth();
  const [email, setEmail] = useState('demo@minicrm.io');
  const [password, setPassword] = useState('demopass123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    try {
      setLoading(true);
      await demoLogin();
    } catch (err) {
      setError(err.message || 'Failed to login with demo account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 40%), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.1), transparent 40%), var(--bg-app)'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.3s ease'
        }}
      >
        {/* Brand Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 24px var(--primary-glow)',
              marginBottom: '14px'
            }}
          >
            <Zap size={28} fill="white" />
          </div>
          <h2 style={{ fontSize: '1.65rem', fontWeight: 800 }}>Welcome to Nexus CRM</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '6px' }}>
            AI-powered deal tracking and contact management
          </p>
        </div>

        {/* Demo One-Click Login Button */}
        <button
          type="button"
          className="btn btn-ai"
          onClick={handleDemoLogin}
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            marginBottom: '20px',
            fontSize: '0.92rem',
            fontWeight: 700
          }}
          id="demo-login-btn"
        >
          <Sparkles size={18} />
          <span>Instant 1-Click Demo Login</span>
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            margin: '18px 0',
            color: 'var(--text-subtle)',
            fontSize: '0.78rem'
          }}
        >
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
          <span>OR SIGN IN WITH EMAIL</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '10px 14px',
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--accent-rose)',
              fontSize: '0.84rem',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                id="login-email"
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '22px' }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id="login-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: '0.92rem' }}
            id="login-submit-btn"
          >
            <span>{loading ? 'Signing In...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer switch */}
        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            id="switch-to-register-btn"
          >
            Create an account
          </button>
        </div>
      </div>
    </div>
  );
}
