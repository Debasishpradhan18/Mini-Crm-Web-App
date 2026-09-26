import React, { useState } from 'react';
import { 
  Activity, 
  Sparkles, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  Calendar, 
  User, 
  DollarSign, 
  TrendingUp,
  Plus
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export function ActivityFeed() {
  const { activities, openDrawer, openDealModal } = useCRM();
  const [filterType, setFilterType] = useState('All');

  const filtered = activities.filter((act) => {
    if (filterType === 'All') return true;
    if (filterType === 'AI') return act.type === 'ai_assist';
    if (filterType === 'Stage') return act.type === 'stage_change';
    if (filterType === 'Notes') return act.type === 'note';
    return true;
  });

  const getActivityIcon = (type) => {
    switch (type) {
      case 'ai_assist':
        return <Sparkles size={16} color="#ec4899" />;
      case 'stage_change':
        return <TrendingUp size={16} color="var(--accent-amber)" />;
      case 'deal_created':
        return <DollarSign size={16} color="var(--accent-emerald)" />;
      case 'email':
        return <Mail size={16} color="var(--primary)" />;
      case 'call':
        return <Phone size={16} color="var(--accent-cyan)" />;
      default:
        return <FileText size={16} color="var(--text-muted)" />;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Live CRM Activity Stream</h1>
          <p className="page-subtitle">
            Comprehensive audit log of calls, notes, deal progression, and AI drafts.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {['All', 'AI', 'Stage', 'Notes'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterType(f)}
              style={{
                padding: '6px 14px',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.82rem',
                fontWeight: 600,
                border: '1px solid',
                borderColor: filterType === f ? 'var(--primary)' : 'var(--border-color)',
                background: filterType === f ? 'var(--primary-light)' : 'var(--bg-card)',
                color: filterType === f ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              {f === 'AI' ? 'AI Assists' : f === 'Stage' ? 'Stage Changes' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Timeline List */}
      <div className="table-wrapper" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', borderLeft: '2px solid var(--border-color)', paddingLeft: '24px', marginLeft: '12px' }}>
          {filtered.map((act) => (
            <div key={act.id} style={{ position: 'relative' }}>
              <div
                style={{
                  position: 'absolute',
                  left: '-34px',
                  top: '0px',
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'var(--bg-sidebar)',
                  border: '2px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {getActivityIcon(act.type)}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {act.title}
                  </span>
                  {act.contact_name && (
                    <span
                      onClick={() => act.contact_id && openDrawer(act.contact_id)}
                      style={{ fontSize: '0.78rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, background: 'var(--primary-light)', padding: '2px 8px', borderRadius: '6px' }}
                    >
                      {act.contact_name}
                    </span>
                  )}
                  {act.deal_title && (
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent-emerald)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
                      {act.deal_title}
                    </span>
                  )}
                </div>

                <span style={{ fontSize: '0.76rem', color: 'var(--text-subtle)' }}>
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>

              <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', marginTop: '6px', lineHeight: 1.5, background: 'var(--bg-input)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                {act.description}
              </p>
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No activities found for this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
