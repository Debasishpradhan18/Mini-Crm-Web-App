import React, { useState, useEffect } from 'react';
import { X, DollarSign, Calendar, TrendingUp, Sparkles, Building2, User } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];
const PRIORITIES = ['Low', 'Medium', 'High'];

export function DealModal() {
  const { dealModal, closeDealModal, saveDeal, contacts } = useCRM();
  const { isOpen, deal, defaultStage, defaultContactId } = dealModal;

  const [formData, setFormData] = useState({
    title: '',
    value: '',
    contact_id: '',
    stage: 'New',
    probability: 20,
    priority: 'Medium',
    expected_close_date: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (deal) {
      setFormData({
        title: deal.title || '',
        value: deal.value || '',
        contact_id: deal.contact_id ? String(deal.contact_id) : '',
        stage: deal.stage || 'New',
        probability: deal.probability !== undefined ? deal.probability : 20,
        priority: deal.priority || 'Medium',
        expected_close_date: deal.expected_close_date || '',
        notes: deal.notes || ''
      });
    } else {
      setFormData({
        title: '',
        value: '',
        contact_id: defaultContactId ? String(defaultContactId) : '',
        stage: defaultStage || 'New',
        probability: defaultStage === 'Qualified' ? 70 : (defaultStage === 'Contacted' ? 40 : 20),
        priority: 'Medium',
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        notes: ''
      });
    }
    setErrors({});
  }, [deal, defaultStage, defaultContactId, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-update probability when stage changes if default
      if (name === 'stage') {
        const stageProbs = { 'New': 20, 'Contacted': 40, 'Qualified': 70, 'Won': 100, 'Lost': 0 };
        updated.probability = stageProbs[value] !== undefined ? stageProbs[value] : 20;
      }
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Deal title is required.';
    }
    if (formData.value === '' || isNaN(Number(formData.value)) || Number(formData.value) < 0) {
      newErrors.value = 'Please enter a valid deal amount.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      await saveDeal(
        {
          ...formData,
          value: Number(formData.value),
          contact_id: formData.contact_id ? Number(formData.contact_id) : null,
          probability: Number(formData.probability)
        },
        deal?.id || null
      );
    } catch (err) {
      // Error handled by context toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeDealModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <DollarSign size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {deal ? 'Edit Deal' : 'Create New Opportunity'}
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeDealModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Deal Title *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                placeholder="e.g. CloudScale Enterprise Migration"
                value={formData.title}
                onChange={handleChange}
                id="deal-form-title"
                required
              />
              {errors.title && <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem' }}>{errors.title}</span>}
            </div>

            {/* Value & Stage */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Deal Value ($ USD) *</label>
                <input
                  type="number"
                  name="value"
                  className="form-input"
                  placeholder="25000"
                  value={formData.value}
                  onChange={handleChange}
                  id="deal-form-value"
                  min="0"
                  step="100"
                  required
                />
                {errors.value && <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem' }}>{errors.value}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Pipeline Stage</label>
                <select
                  name="stage"
                  className="form-select"
                  value={formData.stage}
                  onChange={handleChange}
                  id="deal-form-stage"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Associated Contact & Priority */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Associated Contact</label>
                <select
                  name="contact_id"
                  className="form-select"
                  value={formData.contact_id}
                  onChange={handleChange}
                  id="deal-form-contact"
                >
                  <option value="">-- No Contact Assigned --</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Priority</label>
                <select
                  name="priority"
                  className="form-select"
                  value={formData.priority}
                  onChange={handleChange}
                  id="deal-form-priority"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>{p} Priority</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Probability Slider & Expected Close Date */}
            <div className="form-row">
              <div className="form-group">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label className="form-label">Win Probability</label>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary)' }}>
                    {formData.probability}%
                  </span>
                </div>
                <input
                  type="range"
                  name="probability"
                  min="0"
                  max="100"
                  step="5"
                  value={formData.probability}
                  onChange={handleChange}
                  style={{ width: '100%', accentColor: 'var(--primary)', marginTop: '8px' }}
                  id="deal-form-prob"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Expected Close Date</label>
                <input
                  type="date"
                  name="expected_close_date"
                  className="form-input"
                  value={formData.expected_close_date}
                  onChange={handleChange}
                  id="deal-form-date"
                />
              </div>
            </div>

            {/* Notes & Context */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Deal Notes & Requirements</label>
              <textarea
                name="notes"
                className="form-textarea"
                rows="3"
                placeholder="Key requirements, client objections, timeline constraints..."
                value={formData.notes}
                onChange={handleChange}
                id="deal-form-notes"
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeDealModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-deal-submit-btn">
              {submitting ? 'Saving...' : (deal ? 'Update Deal' : 'Create Deal')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
