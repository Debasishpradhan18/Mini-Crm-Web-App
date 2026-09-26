import React, { useState } from 'react';
import { Mail, Lock, User, Building2, Zap, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Register({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    company: '',
    role: 'Sales Representative'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      await register(formData);
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
          maxWidth: '460px',
          background: 'var(--bg-sidebar)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          boxShadow: 'var(--shadow-lg)',
          animation: 'scaleIn 0.3s ease'
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-lg)',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              boxShadow: '0 8px 24px var(--primary-glow)',
              marginBottom: '12px'
            }}
          >
            <Zap size={26} fill="white" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
            Get started with AI-driven pipeline tracking
          </p>
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
              marginBottom: '16px'
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              type="text"
              name="name"
              className="form-input"
              placeholder="e.g. Alex Morgan"
              value={formData.name}
              onChange={handleChange}
              id="register-name"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              name="email"
              className="form-input"
              placeholder="alex@company.com"
              value={formData.email}
              onChange={handleChange}
              id="register-email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password * (min 6 chars)</label>
            <input
              type="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              id="register-password"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Company Name</label>
              <input
                type="text"
                name="company"
                className="form-input"
                placeholder="Apex Corp"
                value={formData.company}
                onChange={handleChange}
                id="register-company"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Role</label>
              <input
                type="text"
                name="role"
                className="form-input"
                placeholder="Sales Director"
                value={formData.role}
                onChange={handleChange}
                id="register-role"
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', padding: '11px', fontSize: '0.92rem', marginTop: '6px' }}
            id="register-submit-btn"
          >
            <span>{loading ? 'Creating Account...' : 'Get Started'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontWeight: 700,
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
            id="switch-to-login-btn"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}
