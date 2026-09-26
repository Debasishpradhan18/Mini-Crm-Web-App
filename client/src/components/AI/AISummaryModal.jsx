import React, { useState, useEffect } from 'react';
import { 
  X, 
  Brain, 
  Sparkles, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Activity, 
  RefreshCw,
  Zap
} from 'lucide-react';
import { api } from '../../services/api';
import { useCRM } from '../../context/CRMContext';
import { useToast } from '../../context/ToastContext';

export function AISummaryModal() {
  const { aiSummaryModal, closeAISummaryModal, openAIEmailModal } = useCRM();
  const { isOpen, contact } = aiSummaryModal;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  useEffect(() => {
    if (isOpen && contact?.id) {
      loadSummary();
    }
  }, [isOpen, contact]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res = await api.ai.summarizeContact(contact.id);
      if (res.success && res.data) {
        setSummaryData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to generate AI summary', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={closeAISummaryModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <Brain size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                AI Account Intelligence & Summary
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {contact?.name} • {contact?.company || 'Account'}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeAISummaryModal}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Brain size={36} color="var(--primary)" className="pulse" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Analyzing contact notes, deals, and communication timeline...</p>
            </div>
          ) : summaryData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Top Sentiment & Score Banner */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Relationship Sentiment
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-emerald)' }} />
                    <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                      {summaryData.sentiment || 'Positive'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Pipeline Volume
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
                    ${Number(summaryData.pipelineValue || 0).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Summary Text */}
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                  Executive Synthesis
                </h4>
                <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-main)', whiteSpace: 'pre-line' }}>
                  {summaryData.summary}
                </div>
              </div>

              {/* Recommended Next Best Actions */}
              {summaryData.recommendedActions && summaryData.recommendedActions.length > 0 && (
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Recommended Next Actions
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {summaryData.recommendedActions.map((action, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem' }}>
                        <CheckCircle2 size={16} color="var(--accent-emerald)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={loadSummary}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Regenerate Analysis</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeAISummaryModal}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-ai"
              onClick={() => {
                closeAISummaryModal();
                openAIEmailModal(contact);
              }}
            >
              <Sparkles size={15} />
              <span>Draft AI Email for Contact</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
