import React, { useState, useEffect } from 'react';
import { 
  X, 
  BrainCircuit, 
  Sparkles, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { api } from '../../services/api';
import { useCRM } from '../../context/CRMContext';
import { useToast } from '../../context/ToastContext';

export function AIDealInsightsModal() {
  const { aiDealModal, closeAIDealModal, openAIEmailModal, contacts } = useCRM();
  const { isOpen, deal } = aiDealModal;
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);
  const [insightData, setInsightData] = useState(null);

  const contact = contacts.find((c) => c.id === deal?.contact_id);

  useEffect(() => {
    if (isOpen && deal?.id) {
      loadDealInsights();
    }
  }, [isOpen, deal]);

  const loadDealInsights = async () => {
    try {
      setLoading(true);
      const res = await api.ai.analyzeDeal(deal.id);
      if (res.success && res.data) {
        setInsightData(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to analyze deal insights', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const probScore = insightData?.winProbability !== undefined ? insightData.winProbability : (deal?.probability || 50);

  return (
    <div className="modal-overlay" onClick={closeAIDealModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--secondary), var(--primary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                boxShadow: '0 4px 14px var(--primary-glow)'
              }}
            >
              <BrainCircuit size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                Deal Intelligence & Win Probability
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {deal?.title} (${Number(deal?.value || 0).toLocaleString()}) • Stage: {deal?.stage}
              </p>
            </div>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeAIDealModal}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="modal-body">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <BrainCircuit size={36} color="var(--primary)" className="pulse" style={{ marginBottom: '12px' }} />
              <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Calculating deal closing velocity, risk signals, and recommendations...</p>
            </div>
          ) : insightData ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {/* Score Meter Banner */}
              <div
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '16px'
                }}
              >
                <div>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Calculated Win Probability
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '4px' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, color: probScore >= 60 ? 'var(--accent-emerald)' : (probScore >= 35 ? 'var(--accent-amber)' : 'var(--accent-rose)'), fontFamily: 'var(--font-heading)' }}>
                      {probScore}%
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Likelihood</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                    Health Assessment
                  </span>
                  <div style={{ marginTop: '6px' }}>
                    <span className="badge badge-status Customer" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
                      {insightData.riskLevel || 'Moderate'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Strengths & Risks Columns */}
              <div className="form-row">
                {/* Strengths */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <CheckCircle2 size={16} color="var(--accent-emerald)" />
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-emerald)', textTransform: 'uppercase' }}>
                      Deal Drivers
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    {insightData.strengths && insightData.strengths.length > 0 ? (
                      insightData.strengths.map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-main)' }}>
                          <span>•</span>
                          <span>{s}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No strong drivers identified yet.</span>
                    )}
                  </div>
                </div>

                {/* Risks */}
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <AlertTriangle size={16} color="var(--accent-amber)" />
                    <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase' }}>
                      Potential Obstacles
                    </h4>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem' }}>
                    {insightData.risks && insightData.risks.length > 0 ? (
                      insightData.risks.map((r, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: 'var(--text-main)' }}>
                          <span>•</span>
                          <span>{r}</span>
                        </div>
                      ))
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>No high risks flagged for this stage.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommended Next Steps */}
              {insightData.recommendedNextSteps && insightData.recommendedNextSteps.length > 0 && (
                <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
                  <h4 style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '10px' }}>
                    Recommended Tactical Next Steps
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {insightData.recommendedNextSteps.map((step, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.86rem' }}>
                        <ArrowRight size={15} color="var(--primary)" style={{ marginTop: '2px', flexShrink: 0 }} />
                        <span>{step}</span>
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
            onClick={loadDealInsights}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Re-evaluate</span>
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" className="btn btn-secondary" onClick={closeAIDealModal}>
              Close
            </button>
            <button
              type="button"
              className="btn btn-ai"
              onClick={() => {
                closeAIDealModal();
                openAIEmailModal(contact || { name: 'Client' }, deal);
              }}
            >
              <Sparkles size={15} />
              <span>Draft Follow-up Email</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
