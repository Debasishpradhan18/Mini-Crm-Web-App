import React from 'react';
import { 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Sparkles, 
  FileText, 
  Edit2, 
  Trash2, 
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export function ContactCard({ contact }) {
  const { 
    openContactModal, 
    deleteContact, 
    openAIEmailModal, 
    openAISummaryModal, 
    openDrawer,
    openDealModal
  } = useCRM();

  return (
    <div
      className="metric-card"
      style={{
        cursor: 'pointer',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px'
      }}
      onClick={() => openDrawer(contact.id)}
      id={`contact-card-${contact.id}`}
    >
      <div>
        {/* Header Avatar & Status */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}`}
              alt={contact.name}
              style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
            />
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                {contact.name}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {contact.job_title ? `${contact.job_title} • ` : ''}{contact.company || 'Private Account'}
              </p>
            </div>
          </div>

          <span className={`badge badge-status ${contact.status || 'Lead'}`}>
            {contact.status || 'Lead'}
          </span>
        </div>

        {/* Contact Methods */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '12px 0', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          {contact.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14} color="var(--primary)" />
              <span style={{ color: 'var(--text-main)' }}>{contact.email}</span>
            </div>
          )}
          {contact.phone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14} color="var(--accent-emerald)" />
              <span>{contact.phone}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', margin: '10px 0' }}>
            {contact.tags.map((tag, idx) => (
              <span key={idx} className="tag-pill">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Pipeline Value */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border-color)', marginTop: '10px' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pipeline Volume</span>
          <span style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
            ${Number(contact.total_pipeline_value || contact.value || 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Card Action Footer */}
      <div 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          paddingTop: '12px', 
          marginTop: '6px',
          borderTop: '1px solid var(--border-color)' 
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* AI Email Button */}
          <button
            className="btn btn-ai btn-sm"
            onClick={() => openAIEmailModal(contact)}
            title="Draft AI Email"
            id={`ai-email-contact-${contact.id}`}
          >
            <Sparkles size={13} />
            <span>AI Email</span>
          </button>

          {/* AI Summary Button */}
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => openAISummaryModal(contact)}
            title="AI Executive Summary"
            id={`ai-summary-contact-${contact.id}`}
          >
            <Brain size={13} color="var(--primary)" />
            <span>AI Summary</span>
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => openContactModal(contact)}
            title="Edit Contact"
          >
            <Edit2 size={14} />
          </button>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => {
              if (window.confirm(`Delete contact "${contact.name}"?`)) {
                deleteContact(contact.id);
              }
            }}
            title="Delete Contact"
            style={{ color: 'var(--accent-rose)' }}
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
