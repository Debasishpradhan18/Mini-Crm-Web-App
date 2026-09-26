import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  RefreshCw, 
  Mail, 
  Building2, 
  User, 
  FileText,
  BookmarkPlus
} from 'lucide-react';
import { api } from '../../services/api';
import { useCRM } from '../../context/CRMContext';
import { useToast } from '../../context/ToastContext';

const TONES = ['Professional', 'Friendly', 'Persuasive', 'Urgent', 'Casual'];
const OBJECTIVES = [
  'General Follow-up',
  'Product Demo Follow-up',
  'Proposal Review & Next Steps',
  'Closing Deal & Contract Finalization',
  'Re-engage Inactive / Cold Account'
];

export function AIEmailModal() {
  const { aiEmailModal, closeAIEmailModal, addContactNote } = useCRM();
  const { isOpen, contact, deal } = aiEmailModal;
  const { showToast } = useToast();

  const [tone, setTone] = useState('Professional');
  const [objective, setObjective] = useState('General Follow-up');
  const [customNotes, setCustomNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [copied, setCopied] = useState(false);
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTone('Professional');
      // Suggest objective based on deal stage
      if (deal?.stage === 'Qualified') {
        setObjective('Proposal Review & Next Steps');
      } else if (deal?.stage === 'Contacted') {
        setObjective('Product Demo Follow-up');
      } else if (deal?.stage === 'Won') {
        setObjective('Closing Deal & Contract Finalization');
      } else {
        setObjective('General Follow-up');
      }
      setCustomNotes('');
      setGeneratedEmail(null);
      setSubject('');
      setBody('');
      setCopied(false);

      // Auto-trigger initial draft on open
      handleGenerate();
    }
  }, [isOpen, contact, deal]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const res = await api.ai.draftEmail({
        contactId: contact?.id,
        dealId: deal?.id,
        tone,
        objective,
        customNotes
      });

      if (res.success && res.data) {
        setGeneratedEmail(res.data);
        setSubject(res.data.subject || 'Follow-up regarding our discussion');
        setBody(res.data.body || '');
      }
    } catch (err) {
      showToast(err.message || 'Failed to draft AI email', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = `${subject ? `Subject: ${subject}\n\n` : ''}${body}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    showToast('Email copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToTimeline = async () => {
    if (!contact?.id) return;
    try {
      setSavingNote(true);
      const noteContent = `[Drafted AI Email - ${tone} Tone / ${objective}]:\nSubject: ${subject}\n\n${body}`;
      await addContactNote(contact.id, noteContent);
      showToast('Saved email draft to contact activity timeline!', 'success');
    } catch (err) {
      // Toast already shown
    } finally {
      setSavingNote(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAIEmailModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '720px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #ec4899, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px rgba(236, 72, 153, 0.35)'
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                AI Follow-up Email Drafter
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Powered by AI & CRM context: {contact?.name || 'Contact'} {deal ? `• ${deal.title} (${deal.stage})` : ''}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeAIEmailModal}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body">
          {/* Controls Bar: Tone & Objective */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              padding: '16px',
              marginBottom: '20px'
            }}
          >
            <div className="form-row" style={{ marginBottom: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Tone</label>
                <select
                  className="form-select"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  id="ai-email-tone"
                >
                  {TONES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Email Objective</label>
                <select
                  className="form-select"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  id="ai-email-objective"
                >
                  {OBJECTIVES.map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Notes input */}
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label">Custom Instruction / Extra Context (Optional)</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g., Mention our 20% Q4 discount, or suggest a 15-min call on Thursday"
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                id="ai-email-custom-notes"
              />
            </div>

            <button
              className="btn btn-ai btn-sm"
              onClick={handleGenerate}
              disabled={loading}
              style={{ width: '100%' }}
              id="regenerate-ai-email-btn"
            >
              <RefreshCw size={14} className={loading ? 'spin' : ''} />
              <span>{loading ? 'AI is drafting email...' : 'Generate / Regenerate Email Draft'}</span>
            </button>
          </div>

          {/* Generated Result Area */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                Generated Output (Directly Editable)
              </label>
              {generatedEmail?.modelUsed && (
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                  Model: {generatedEmail.modelUsed}
                </span>
              )}
            </div>

            {loading ? (
              <div
                style={{
                  minHeight: '220px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  color: 'var(--text-muted)'
                }}
              >
                <Sparkles size={28} color="#ec4899" className="pulse" />
                <p style={{ fontSize: '0.88rem' }}>Crafting personalized outreach based on contact notes & stage...</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  className="form-input"
                  style={{ fontWeight: 700 }}
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject Line"
                  id="ai-email-subject"
                />

                <textarea
                  className="form-textarea"
                  rows="9"
                  style={{ lineHeight: 1.5, fontFamily: 'var(--font-main)', fontSize: '0.88rem' }}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Generated email body..."
                  id="ai-email-body"
                />
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {contact?.id && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleSaveToTimeline}
                disabled={savingNote || !body}
                title="Save this draft as an entry in contact timeline"
                id="save-draft-note-btn"
              >
                <BookmarkPlus size={15} />
                <span>{savingNote ? 'Saving...' : 'Save as Note'}</span>
              </button>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeAIEmailModal}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCopy}
              disabled={!body}
              id="copy-ai-email-btn"
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
