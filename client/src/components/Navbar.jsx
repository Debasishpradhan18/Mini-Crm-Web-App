import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Sun, 
  Moon, 
  Settings, 
  LogOut, 
  User, 
  Sparkles, 
  RotateCcw, 
  Layers, 
  Menu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCRM } from '../context/CRMContext';

export function Navbar({ onToggleMobileMenu }) {
  const { user, logout } = useAuth();
  const { 
    searchQuery, 
    setSearchQuery, 
    openContactModal, 
    openDealModal, 
    openSettingsModal,
    resetDemoData 
  } = useCRM();

  const [isDark, setIsDark] = useState(() => {
    return !document.body.classList.contains('theme-light');
  });
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.body.classList.remove('theme-light');
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
      document.body.classList.add('theme-light');
    }
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  return (
    <header className="top-navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button 
          className="btn btn-icon"
          onClick={onToggleMobileMenu}
          style={{ display: 'none' }}
          id="mobile-menu-btn"
          title="Toggle Navigation"
        >
          <Menu size={20} />
        </button>

        {/* Global Search Bar */}
        <div className="search-input-wrapper">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search deals, contacts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="global-search-input"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-subtle)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Right Action Icons & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Quick Add Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm"
            onClick={() => openContactModal()}
            id="add-contact-btn"
            title="Create Contact"
          >
            <Plus size={15} />
            <span>Contact</span>
          </button>

          <button 
            className="btn btn-primary btn-sm"
            onClick={() => openDealModal()}
            id="add-deal-btn"
            title="Create Deal"
          >
            <Plus size={15} />
            <span>New Deal</span>
          </button>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-color)', margin: '0 4px' }} />

        {/* Theme Toggle */}
        <button
          className="btn btn-icon"
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-btn"
        >
          {isDark ? <Sun size={18} color="#fbbf24" /> : <Moon size={18} color="#6366f1" />}
        </button>

        {/* AI & App Settings */}
        <button
          className="btn btn-icon"
          onClick={openSettingsModal}
          title="AI Settings & Config"
          id="settings-btn"
        >
          <Settings size={18} />
        </button>

        {/* User Profile Pill */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              padding: '5px 12px 5px 6px',
              borderRadius: 'var(--radius-full)',
              cursor: 'pointer',
              color: 'var(--text-main)'
            }}
            id="user-profile-menu-btn"
          >
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
            />
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, lineHeight: 1.1 }}>{user?.name || 'Sales Rep'}</span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-subtle)', lineHeight: 1 }}>{user?.company || 'Team'}</span>
            </div>
          </button>

          {/* Profile Dropdown */}
          {profileDropdownOpen && (
            <>
              <div 
                style={{ position: 'fixed', inset: 0, zIndex: 35 }} 
                onClick={() => setProfileDropdownOpen(false)} 
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '115%',
                  width: '240px',
                  background: 'var(--bg-sidebar)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '8px',
                  boxShadow: 'var(--shadow-lg)',
                  zIndex: 40,
                  animation: 'scaleIn 0.15s ease'
                }}
              >
                <div style={{ padding: '10px 12px', borderBottom: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '0.88rem', fontWeight: 700 }}>{user?.name}</p>
                  <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{user?.email}</p>
                  <span className="badge badge-status Customer" style={{ marginTop: '6px', fontSize: '0.68rem' }}>
                    {user?.role || 'Sales Lead'}
                  </span>
                </div>

                <div style={{ padding: '6px 0' }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      openSettingsModal();
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    <Settings size={16} />
                    <span>AI & Profile Settings</span>
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      if (window.confirm('Reset all CRM data back to initial sample demo dataset?')) {
                        resetDemoData();
                      }
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    <RotateCcw size={16} />
                    <span>Reset Demo Dataset</span>
                  </button>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                  <button
                    className="btn btn-ghost"
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      logout();
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)', padding: '8px 12px' }}
                    id="logout-btn"
                  >
                    <LogOut size={16} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
