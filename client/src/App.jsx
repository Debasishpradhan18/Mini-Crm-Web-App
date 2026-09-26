import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useCRM } from './context/CRMContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { KanbanBoard } from './components/Kanban/KanbanBoard';
import { ContactList } from './components/Contacts/ContactList';
import { AnalyticsDashboard } from './components/Analytics/AnalyticsDashboard';
import { ActivityFeed } from './components/Activities/ActivityFeed';
import { ContactModal } from './components/Contacts/ContactModal';
import { DealModal } from './components/Kanban/DealModal';
import { ContactDrawer } from './components/Contacts/ContactDrawer';
import { AIEmailModal } from './components/AI/AIEmailModal';
import { AISummaryModal } from './components/AI/AISummaryModal';
import { AIDealInsightsModal } from './components/AI/AIDealInsightsModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { Login } from './components/Auth/Login';
import { Register } from './components/Auth/Register';
import { Zap } from 'lucide-react';

export function App() {
  const { isAuthenticated, loading } = useAuth();
  const { activeTab } = useCRM();

  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--bg-app)',
          color: 'var(--text-main)',
          gap: '16px'
        }}
      >
        <div
          style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            boxShadow: '0 8px 24px var(--primary-glow)'
          }}
        >
          <Zap size={26} fill="white" />
        </div>
        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-muted)' }}>
          Loading Nexus CRM Intelligence...
        </p>
      </div>
    );
  }

  // If not authenticated, render Login or Register
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <Register onSwitchToLogin={() => setAuthView('login')} />;
    }
    return <Login onSwitchToRegister={() => setAuthView('register')} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Navbar onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />

        {/* Tab Routing */}
        <main style={{ flex: 1 }}>
          {activeTab === 'pipeline' && <KanbanBoard />}
          {activeTab === 'contacts' && <ContactList />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'activities' && <ActivityFeed />}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <ContactModal />
      <DealModal />
      <ContactDrawer />
      <AIEmailModal />
      <AISummaryModal />
      <AIDealInsightsModal />
      <SettingsModal />
    </div>
  );
}

export default App;
