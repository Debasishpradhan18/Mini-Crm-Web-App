import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building2, Briefcase, Tag, DollarSign, FileText } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

const STATUSES = ['Lead', 'Prospect', 'Customer', 'Inactive'];

export function ContactModal() {
  const { contactModal, closeContactModal, saveContact } = useCRM();
  const { isOpen, contact } = contactModal;

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    job_title: '',
    status: 'Lead',
    tagsInput: '',
    value: '',
    notes: '',
    avatar: ''
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        email: contact.email || '',
        phone: contact.phone || '',
        company: contact.company || '',
        job_title: contact.job_title || '',
        status: contact.status || 'Lead',
        tagsInput: Array.isArray(contact.tags) ? contact.tags.join(', ') : '',
        value: contact.value || '',
        notes: contact.notes || '',
        avatar: contact.avatar || ''
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        job_title: '',
        status: 'Lead',
        tagsInput: '',
        value: '',
        notes: '',
        avatar: ''
      });
    }
    setErrors({});
  }, [contact, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required.';
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Process tags into array
    const tagsArray = formData.tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter((t) => t.length > 0);

    try {
      setSubmitting(true);
      await saveContact(
        {
          ...formData,
          tags: tagsArray,
          value: formData.value ? Number(formData.value) : 0
        },
        contact?.id || null
      );
    } catch (err) {
      // Toast already shown
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeContactModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <User size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              {contact ? 'Edit Contact' : 'Add New Contact'}
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeContactModal}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Sarah Jenkins"
                value={formData.name}
                onChange={handleChange}
                id="contact-form-name"
                required
              />
              {errors.name && <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem' }}>{errors.name}</span>}
            </div>

            {/* Email & Phone */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="sarah@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  id="contact-form-email"
                />
                {errors.email && <span style={{ color: 'var(--accent-rose)', fontSize: '0.78rem' }}>{errors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  className="form-input"
                  placeholder="+1 (555) 019-2834"
                  value={formData.phone}
                  onChange={handleChange}
                  id="contact-form-phone"
                />
              </div>
            </div>

            {/* Company & Job Title */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  name="company"
                  className="form-input"
                  placeholder="CloudScale Dynamics"
                  value={formData.company}
                  onChange={handleChange}
                  id="contact-form-company"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Job Title / Role</label>
                <input
                  type="text"
                  name="job_title"
                  className="form-input"
                  placeholder="CTO / VP of Product"
                  value={formData.job_title}
                  onChange={handleChange}
                  id="contact-form-title"
                />
              </div>
            </div>

            {/* Status & Estimated Value */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Relationship Status</label>
                <select
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                  id="contact-form-status"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Estimated Account Value ($)</label>
                <input
                  type="number"
                  name="value"
                  className="form-input"
                  placeholder="50000"
                  value={formData.value}
                  onChange={handleChange}
                  id="contact-form-value"
                  min="0"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="form-group">
              <label className="form-label">Tags (comma-separated)</label>
              <input
                type="text"
                name="tagsInput"
                className="form-input"
                placeholder="Enterprise, Hot Lead, Decision Maker"
                value={formData.tagsInput}
                onChange={handleChange}
                id="contact-form-tags"
              />
            </div>

            {/* Notes / AI Context */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Contact Background & Interaction Notes</label>
              <textarea
                name="notes"
                className="form-textarea"
                rows="3"
                placeholder="Client challenges, preferred tech stack, decision timeline, notes from calls..."
                value={formData.notes}
                onChange={handleChange}
                id="contact-form-notes"
              />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                💡 These notes will be directly used by the AI Email Drafter to personalize outbound emails.
              </span>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeContactModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-contact-submit-btn">
              {submitting ? 'Saving...' : (contact ? 'Update Contact' : 'Save Contact')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
