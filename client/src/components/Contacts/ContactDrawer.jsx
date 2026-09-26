import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  Phone, 
  Building2, 
  Briefcase, 
  Sparkles, 
  Brain, 
  Plus, 
  Calendar, 
  Clock, 
  Edit2, 
  Trash2, 
  Send,
  MessageSquare,
  Activity as ActivityIcon,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { useCRM } from '../../context/CRMContext';

export function ContactDrawer() {
  const { 
    drawerContactId, 
    closeDrawer, 
    openContactModal, 
    openDealModal, 
    openAIEmailModal, 
    openAISummaryModal,
    addContactNote,
    deleteContact
  } = useCRM();

  const [contactData, setContactData] = useState(null);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    async function loadContactDetails() {
      if (!drawerContactId) {
        setContactData(null);
        return;
      }
      try {
        setLoading(true);
        const res = await api.contacts.getById(drawerContactId);
        if (res.success) {
          setContactData(res.contact);
          setDeals(res.deals || []);
          setActivities(res.activities || []);
        }
      } catch (err) {
        console.error('Error loading contact details:', err);
      } finally {
        setLoading(false);
      }
    }
    loadContactDetails();
  }, [drawerContactId]);

  if (!drawerContactId) return null;

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    try {
      setSavingNote(true);
      await addContactNote(drawerContactId, newNote.trim());
      setNewNote('');
      // Reload drawer activities
      const res = await api.contacts.getById(drawerContactId);
      if (res.success) {
        setContactData(res.contact);
        setActivities(res.activities || []);
      }
    } catch (err) {
      // Toast handled
    } finally {
      setSavingNote(false);
    }
  };

  const totalValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  return (
    <>
      <div className="drawer-overlay" onClick={closeDrawer} />
      <div className="drawer-content" id="contact-detail-drawer">
        {/* Drawer Header */}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <img
              src={contactData?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contactData?.name || 'User')}`}
              alt={contactData?.name}
              style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)' }}
            />
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{contactData?.name || 'Loading...'}</h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {contactData?.job_title ? `${contactData.job_title} at ` : ''}{contactData?.company || 'Account'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {contactData && (
              <button
                className="btn btn-ghost btn-icon"
                onClick={() => openContactModal(contactData)}
                title="Edit Contact Profile"
              >
                <Edit2 size={16} />
              </button>
            )}
            <button className="btn btn-ghost btn-icon" onClick={closeDrawer} title="Close Drawer">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading account history...
            </div>
          ) : contactData ? (
            <>
              {/* Quick AI Assist Actions Banner */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.12), rgba(99, 102, 241, 0.15))',
                  border: '1px solid rgba(236, 72, 153, 0.25)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  marginBottom: '22px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Sparkles size={16} color="#ec4899" />
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    AI Assist Features
                  </span>
                </div>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Generate context-aware follow-up emails or executive summaries based on notes and pipeline history.
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  <button
                    className="btn btn-ai btn-sm"
                    onClick={() => openAIEmailModal(contactData, deals[0] || null)}
                    id="drawer-ai-email-btn"
                  >
                    <Sparkles size={14} />
                    <span>Draft AI Follow-up</span>
                  </button>

                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => openAISummaryModal(contactData)}
                    id="drawer-ai-summary-btn"
                  >
                    <Brain size={14} color="var(--primary)" />
                    <span>Executive Summary</span>
                  </button>
                </div>
              </div>

              {/* Contact Information & Channels */}
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  Contact Information
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.86rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Mail size={15} color="var(--primary)" />
                    <span>{contactData.email || 'No email provided'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Phone size={15} color="var(--accent-emerald)" />
                    <span>{contactData.phone || 'No phone provided'}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Building2 size={15} color="var(--accent-cyan)" />
                    <span>{contactData.company || 'No company listed'}</span>
                  </div>
                </div>

                {/* Status & Tags */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
                  <span className={`badge badge-status ${contactData.status || 'Lead'}`}>
                    {contactData.status || 'Lead'}
                  </span>
                  {contactData.tags && contactData.tags.map((t, i) => (
                    <span key={i} className="tag-pill">#{t}</span>
                  ))}
                </div>
              </div>

              {/* Associated Deals */}
              <div style={{ marginBottom: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                      Associated Deals ({deals.length})
                    </h4>
                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      ${totalValue.toLocaleString()}
                    </span>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => openDealModal(null, 'New', contactData.id)}
                    style={{ fontSize: '0.76rem', color: 'var(--primary)' }}
                  >
                    + Add Deal
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {deals.map((d) => (
                    <div
                      key={d.id}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{d.title}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                          <span className={`badge badge-status ${d.stage}`}>{d.stage}</span>
                          <span>{d.probability}% prob.</span>
                        </div>
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                        ${Number(d.value || 0).toLocaleString()}
                      </div>
                    </div>
                  ))}

                  {deals.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '16px', background: 'var(--bg-card)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                      No active deals linked to this contact.
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Note Adding Form */}
              <div style={{ marginBottom: '22px' }}>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>
                  Log Activity or Note
                </h4>
                <form onSubmit={handleAddNote} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    className="form-textarea"
                    rows="2"
                    placeholder="Type meeting notes, phone call outcomes, client feedback..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    id="drawer-note-input"
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      type="submit"
                      className="btn btn-primary btn-sm"
                      disabled={savingNote || !newNote.trim()}
                    >
                      <Send size={13} />
                      <span>{savingNote ? 'Logging...' : 'Save Note to Timeline'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Activity Timeline */}
              <div>
                <h4 style={{ fontSize: '0.86rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '14px' }}>
                  Interaction Timeline
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', borderLeft: '2px solid var(--border-color)', paddingLeft: '16px', marginLeft: '6px' }}>
                  {activities.map((act) => (
                    <div key={act.id} style={{ position: 'relative' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: '-23px',
                          top: '3px',
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: act.type === 'ai_assist' ? '#ec4899' : (act.type === 'stage_change' ? 'var(--accent-amber)' : 'var(--primary)')
                        }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                          {act.title}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)' }}>
                          {new Date(act.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '3px', lineHeight: 1.4 }}>
                        {act.description}
                      </p>
                    </div>
                  ))}

                  {activities.length === 0 && (
                    <div style={{ color: 'var(--text-subtle)', fontSize: '0.82rem' }}>
                      No activity logged yet.
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
