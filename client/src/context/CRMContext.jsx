import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CRMContext = createContext(null);

export function CRMProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [pipelineSummary, setPipelineSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Global Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [contactStatusFilter, setContactStatusFilter] = useState('All');
  const [dealPriorityFilter, setDealPriorityFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('pipeline'); // 'pipeline' | 'contacts' | 'analytics' | 'activities'

  // Modal & Drawer States
  const [contactModal, setContactModal] = useState({ isOpen: false, contact: null });
  const [dealModal, setDealModal] = useState({ isOpen: false, deal: null, defaultStage: 'New', defaultContactId: null });
  const [aiEmailModal, setAiEmailModal] = useState({ isOpen: false, contact: null, deal: null });
  const [aiSummaryModal, setAiSummaryModal] = useState({ isOpen: false, contact: null });
  const [aiDealModal, setAiDealModal] = useState({ isOpen: false, deal: null });
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [drawerContactId, setDrawerContactId] = useState(null);

  // Load all CRM data
  const refreshData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      const [contactsRes, dealsRes, summaryRes, activitiesRes, analyticsRes] = await Promise.all([
        api.contacts.getAll(),
        api.deals.getAll(),
        api.deals.getPipelineSummary(),
        api.activities.getAll({ limit: 40 }),
        api.analytics.getOverview()
      ]);

      if (contactsRes.success) setContacts(contactsRes.contacts);
      if (dealsRes.success) setDeals(dealsRes.deals);
      if (summaryRes.success) setPipelineSummary(summaryRes);
      if (activitiesRes.success) setActivities(activitiesRes.activities);
      if (analyticsRes.success) setAnalytics(analyticsRes);
    } catch (err) {
      console.error('Error loading CRM data:', err);
      showToast(err.message || 'Failed to sync CRM data', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshData();
    } else {
      setContacts([]);
      setDeals([]);
      setActivities([]);
      setPipelineSummary(null);
      setAnalytics(null);
    }
  }, [isAuthenticated, refreshData]);

  // --- CONTACT ACTIONS ---
  const saveContact = async (formData, id = null) => {
    try {
      if (id) {
        const res = await api.contacts.update(id, formData);
        showToast('Contact updated successfully!', 'success');
      } else {
        const res = await api.contacts.create(formData);
        showToast('Contact added!', 'success');
      }
      await refreshData();
      setContactModal({ isOpen: false, contact: null });
    } catch (err) {
      showToast(err.message || 'Failed to save contact', 'error');
      throw err;
    }
  };

  const deleteContact = async (id) => {
    try {
      await api.contacts.delete(id);
      showToast('Contact removed', 'info');
      if (drawerContactId === id) setDrawerContactId(null);
      await refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to delete contact', 'error');
    }
  };

  const addContactNote = async (contactId, note) => {
    try {
      const res = await api.contacts.addNote(contactId, note);
      showToast('Note added!', 'success');
      await refreshData();
      return res;
    } catch (err) {
      showToast(err.message || 'Failed to add note', 'error');
      throw err;
    }
  };

  // --- DEAL ACTIONS ---
  const saveDeal = async (formData, id = null) => {
    try {
      if (id) {
        await api.deals.update(id, formData);
        showToast('Deal updated!', 'success');
      } else {
        await api.deals.create(formData);
        showToast('Deal created!', 'success');
      }
      await refreshData();
      setDealModal({ isOpen: false, deal: null, defaultStage: 'New', defaultContactId: null });
    } catch (err) {
      showToast(err.message || 'Failed to save deal', 'error');
      throw err;
    }
  };

  const moveDealStage = async (dealId, newStage) => {
    // Find deal
    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    const previousStage = deal.stage;

    // Trigger celebratory confetti if moving into "Won"!
    if (newStage === 'Won' && previousStage !== 'Won') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback
      }
    }

    // Optimistic UI Update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    try {
      await api.deals.updateStage(dealId, newStage);
      showToast(`Deal moved to ${newStage}`, 'success');
      // Background sync full metrics
      const [summaryRes, analyticsRes, activitiesRes] = await Promise.all([
        api.deals.getPipelineSummary(),
        api.analytics.getOverview(),
        api.activities.getAll({ limit: 40 })
      ]);
      if (summaryRes.success) setPipelineSummary(summaryRes);
      if (analyticsRes.success) setAnalytics(analyticsRes);
      if (activitiesRes.success) setActivities(activitiesRes.activities);
    } catch (err) {
      // Rollback on error
      setDeals((prev) =>
        prev.map((d) => (d.id === dealId ? { ...d, stage: previousStage } : d))
      );
      showToast(err.message || 'Failed to move deal stage', 'error');
    }
  };

  const deleteDeal = async (id) => {
    try {
      await api.deals.delete(id);
      showToast('Deal removed', 'info');
      await refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to delete deal', 'error');
    }
  };

  // Reset demo data
  const resetDemoData = async () => {
    try {
      await api.seed.reset();
      showToast('Demo dataset reloaded successfully!', 'success');
      await refreshData();
    } catch (err) {
      showToast(err.message || 'Failed to reset demo dataset', 'error');
    }
  };

  return (
    <CRMContext.Provider
      value={{
        contacts,
        deals,
        activities,
        pipelineSummary,
        analytics,
        loading,
        refreshData,
        searchQuery,
        setSearchQuery,
        contactStatusFilter,
        setContactStatusFilter,
        dealPriorityFilter,
        setDealPriorityFilter,
        activeTab,
        setActiveTab,
        // Modals
        contactModal,
        openContactModal: (contact = null) => setContactModal({ isOpen: true, contact }),
        closeContactModal: () => setContactModal({ isOpen: false, contact: null }),
        dealModal,
        openDealModal: (deal = null, defaultStage = 'New', defaultContactId = null) =>
          setDealModal({ isOpen: true, deal, defaultStage, defaultContactId }),
        closeDealModal: () => setDealModal({ isOpen: false, deal: null, defaultStage: 'New', defaultContactId: null }),
        aiEmailModal,
        openAIEmailModal: (contact = null, deal = null) => setAiEmailModal({ isOpen: true, contact, deal }),
        closeAIEmailModal: () => setAiEmailModal({ isOpen: false, contact: null, deal: null }),
        aiSummaryModal,
        openAISummaryModal: (contact) => setAiSummaryModal({ isOpen: true, contact }),
        closeAISummaryModal: () => setAiSummaryModal({ isOpen: false, contact: null }),
        aiDealModal,
        openAIDealModal: (deal) => setAiDealModal({ isOpen: true, deal }),
        closeAIDealModal: () => setAiDealModal({ isOpen: false, deal: null }),
        settingsModalOpen,
        openSettingsModal: () => setSettingsModalOpen(true),
        closeSettingsModal: () => setSettingsModalOpen(false),
        drawerContactId,
        openDrawer: (id) => setDrawerContactId(id),
        closeDrawer: () => setDrawerContactId(null),
        // CRUD handlers
        saveContact,
        deleteContact,
        addContactNote,
        saveDeal,
        moveDealStage,
        deleteDeal,
        resetDemoData
      }}
    >
      {children}
    </CRMContext.Provider>
  );
}

export function useCRM() {
  const context = useContext(CRMContext);
  if (!context) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return context;
}
