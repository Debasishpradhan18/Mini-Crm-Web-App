import React from 'react';
import { 
  Kanban, 
  Users, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Zap, 
  DollarSign, 
  Award,
  Layers
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';

export function Sidebar({ mobileOpen, onCloseMobile }) {
  const { activeTab, setActiveTab, contacts, deals, pipelineSummary } = useCRM();

  const navItems = [
    {
      id: 'pipeline',
      label: 'Deal Pipeline',
      icon: Kanban,
      badge: deals.length
    },
    {
      id: 'contacts',
      label: 'Contacts',
      icon: Users,
      badge: contacts.length
    },
    {
      id: 'analytics',
      label: 'Sales Analytics',
      icon: TrendingUp
    },
    {
      id: 'activities',
      label: 'Activity Stream',
      icon: Activity
    }
  ];

  const wonDealsCount = deals.filter(d => d.stage === 'Won').length;
  const wonRevenue = deals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  return (
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      {/* Brand Header */}
      <div className="sidebar-header">
        <div className="brand-logo-icon">
          <Zap size={22} fill="white" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="brand-title">Nexus CRM</span>
            <span 
              style={{
                fontSize: '0.62rem',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                color: 'white',
                padding: '1px 5px',
                borderRadius: '4px',
                letterSpacing: '0.04em'
              }}
            >
              AI
            </span>
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontWeight: 500 }}>
            Deal & Contact Pipeline
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onCloseMobile) onCloseMobile();
              }}
              className={`nav-link ${isActive ? 'active' : ''}`}
              id={`nav-${item.id}`}
            >
              <Icon size={18} />
              <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {item.badge !== undefined && (
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '2px 7px',
                    borderRadius: '10px',
                    background: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-muted)',
                    fontWeight: 700
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mini Performance Widget in Sidebar */}
      <div style={{ padding: '16px', margin: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <Award size={16} color="var(--accent-emerald)" />
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Closed Revenue
          </span>
        </div>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
          ${wonRevenue.toLocaleString()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <span>{wonDealsCount} deal(s) won</span>
          <span>{pipelineSummary?.metrics?.winRate || 0}% Win Rate</span>
        </div>
      </div>

      {/* Footer Info */}
      <div className="sidebar-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
          <Sparkles size={14} color="var(--primary)" />
          <span>AI Assist Ready</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-subtle)' }}>v1.0</span>
      </div>
    </aside>
  );
}
