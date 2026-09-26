import React, { useState, useEffect } from 'react';
import { 
  X, 
  Settings, 
  Key, 
  Sparkles, 
  User, 
  Building2, 
  RotateCcw, 
  ShieldCheck, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCRM } from '../../context/CRMContext';

export function SettingsModal() {
  const { user, settings, updateProfile } = useAuth();
  const { settingsModalOpen, closeSettingsModal, resetDemoData } = useCRM();

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    aiApiKey: '',
    aiProvider: 'gemini'
  });

  const [submitting, setSubmitting] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (settingsModalOpen && user) {
      setFormData({
        name: user.name || '',
        company: user.company || '',
        role: user.role || 'Sales Lead',
        aiApiKey: settings?.ai_api_key || '',
        aiProvider: settings?.ai_provider || 'gemini'
      });
    }
  }, [settingsModalOpen, user, settings]);

  if (!settingsModalOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await updateProfile(formData);
      closeSettingsModal();
    } catch (err) {
      // Toast handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetData = async () => {
    if (window.confirm('Are you sure you want to reset all contacts and deals to the initial sample demo dataset?')) {
      try {
        setResetting(true);
        await resetDemoData();
        closeSettingsModal();
      } catch (err) {
        // Toast handled
      } finally {
        setResetting(false);
      }
    }
  };

  return (
    <div className="modal-overlay" onClick={closeSettingsModal}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Settings size={18} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
              CRM & AI Settings
            </h3>
          </div>
          <button className="btn btn-ghost btn-icon" onClick={closeSettingsModal}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave}>
          <div className="modal-body">
            {/* AI Settings Section */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <Sparkles size={18} color="#ec4899" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>AI Integration Engine</h4>
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '14px', lineHeight: 1.4 }}>
                Nexus CRM includes an intelligent contextual AI fallback engine that works offline. You can also connect your own API key for live frontier LLM generation:
              </p>

              <div className="form-group">
                <label className="form-label">AI Provider</label>
                <select
                  name="aiProvider"
                  className="form-select"
                  value={formData.aiProvider}
                  onChange={handleChange}
                  id="settings-ai-provider"
                >
                  <option value="gemini">Google Gemini (Gemini 1.5 / 2.5 Flash)</option>
                  <option value="openai">OpenAI (GPT-4o-mini / GPT-4)</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">API Key (Optional)</label>
                <input
                  type="password"
                  name="aiApiKey"
                  className="form-input"
                  placeholder={formData.aiProvider === 'gemini' ? 'AIzaSy...' : 'sk-...'}
                  value={formData.aiApiKey}
                  onChange={handleChange}
                  id="settings-ai-key"
                />
                <span style={{ fontSize: '0.74rem', color: 'var(--text-subtle)', marginTop: '4px' }}>
                  🔒 Keys are stored securely in your local SQLite database session.
                </span>
              </div>
            </div>

            {/* Profile Section */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '18px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <User size={18} color="var(--primary)" />
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800 }}>User Profile & Business</h4>
              </div>

              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  className="form-input"
                  value={formData.name}
                  onChange={handleChange}
                  id="settings-profile-name"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Company / Organization</label>
                  <input
                    type="text"
                    name="company"
                    className="form-input"
                    value={formData.company}
                    onChange={handleChange}
                    id="settings-profile-company"
                  />
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Job Role</label>
                  <input
                    type="text"
                    name="role"
                    className="form-input"
                    value={formData.role}
                    onChange={handleChange}
                    id="settings-profile-role"
                  />
                </div>
              </div>
            </div>

            {/* Demo Reset Section */}
            <div style={{ border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.05)', borderRadius: 'var(--radius-md)', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  Reload Demo Dataset
                </span>
                <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                  Restores default contacts and active pipeline deals for testing.
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetData}
                disabled={resetting}
                id="reset-demo-dataset-btn"
              >
                <RotateCcw size={14} />
                <span>{resetting ? 'Resetting...' : 'Reset Data'}</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={closeSettingsModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting} id="save-settings-btn">
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
