import React, { useState } from 'react';
import { 
  DollarSign, 
  Calendar, 
  Sparkles, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Activity, 
  User, 
  Building2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export function DealCard({ deal, isDragging, onDragStart, onDragEnd }) {
  const { 
    openDealModal, 
    deleteDeal, 
    openAIEmailModal, 
    openAIDealModal,
    openDrawer,
    contacts 
  } = useCRM();

  const [menuOpen, setMenuOpen] = useState(false);

  const contact = contacts.find((c) => c.id === deal.contact_id);

  const priorityBadgeClass = {
    High: 'badge-high',
    Medium: 'badge-medium',
    Low: 'badge-low'
  }[deal.priority || 'Medium'] || 'badge-medium';

  return (
    <div
      className={`deal-card ${isDragging ? 'dragging' : ''}`}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', deal.id);
        onDragStart(deal.id);
      }}
      onDragEnd={onDragEnd}
      id={`deal-card-${deal.id}`}
    >
      {/* Top Header: Priority & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className={`badge ${priorityBadgeClass}`}>
          {deal.priority || 'Medium'}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {/* AI Deal Intelligence Button */}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              openAIDealModal(deal);
            }}
            title="AI Deal Probability & Strategy"
            style={{ padding: '4px', color: 'var(--secondary)' }}
            id={`ai-insights-deal-${deal.id}`}
          >
            <BrainCircuit size={14} />
          </button>

          {/* AI Email Button */}
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              openAIEmailModal(contact || { name: 'Client' }, deal);
            }}
            title="Draft AI Follow-up Email"
            style={{ padding: '4px', color: '#ec4899' }}
            id={`ai-email-deal-${deal.id}`}
          >
            <Sparkles size={14} />
          </button>

          {/* Edit / Delete Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-ghost btn-icon btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              style={{ padding: '4px' }}
            >
              <MoreVertical size={14} />
            </button>

            {menuOpen && (
              <>
                <div
                  style={{ position: 'fixed', inset: 0, zIndex: 20 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '100%',
                    background: 'var(--bg-sidebar)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    padding: '4px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 25,
                    minWidth: '130px'
                  }}
                >
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      openDealModal(deal);
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '6px 10px' }}
                  >
                    <Edit2 size={13} />
                    <span>Edit Deal</span>
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMenuOpen(false);
                      if (window.confirm(`Delete deal "${deal.title}"?`)) {
                        deleteDeal(deal.id);
                      }
                    }}
                    style={{ width: '100%', justifyContent: 'flex-start', color: 'var(--accent-rose)', padding: '6px 10px' }}
                  >
                    <Trash2 size={13} />
                    <span>Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Deal Title */}
      <h4 
        className="deal-title"
        onClick={() => openDealModal(deal)}
        style={{ cursor: 'pointer' }}
        title="Click to edit deal details"
      >
        {deal.title}
      </h4>

      {/* Deal Value */}
      <div className="deal-value">
        ${Number(deal.value || 0).toLocaleString()}
      </div>

      {/* Contact info row */}
      {(deal.contact_name || contact) && (
        <div 
          className="deal-contact-row"
          onClick={(e) => {
            e.stopPropagation();
            if (deal.contact_id) openDrawer(deal.contact_id);
          }}
          style={{ cursor: deal.contact_id ? 'pointer' : 'default' }}
          title={deal.contact_id ? 'Click to view contact timeline' : ''}
        >
          <img
            src={deal.contact_avatar || contact?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(deal.contact_name || 'Contact')}`}
            alt={deal.contact_name || contact?.name}
            style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
          />
          <span style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: deal.contact_id ? 'underline' : 'none' }}>
            {deal.contact_name || contact?.name}
          </span>
          {(deal.contact_company || contact?.company) && (
            <span style={{ color: 'var(--text-subtle)' }}>
              • {deal.contact_company || contact?.company}
            </span>
          )}
        </div>
      )}

      {/* Footer Info: Probability & Expected Close Date */}
      <div className="deal-card-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
          <TrendingUp size={13} color="var(--primary)" />
          <span>{deal.probability || 0}% prob.</span>
        </div>

        {deal.expected_close_date && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            <Calendar size={13} />
            <span>{deal.expected_close_date}</span>
          </div>
        )}
      </div>
    </div>
  );
}
