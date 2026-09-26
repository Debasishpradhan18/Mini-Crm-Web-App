import React from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Award, 
  Users, 
  Target, 
  Activity, 
  ArrowUpRight, 
  Calendar,
  Sparkles,
  PieChart,
  BarChart2,
  Layers
} from 'lucide-react';
import { useCRM } from '../../context/CRMContext';

export function AnalyticsDashboard() {
  const { analytics, openDealModal, openDrawer } = useCRM();

  const stats = analytics?.stats || {
    totalContacts: 0,
    totalDeals: 0,
    activeDealsCount: 0,
    totalPipelineValue: 0,
    totalWonValue: 0,
    totalWonDeals: 0,
    avgDealSize: 0,
    winRate: 0
  };

  const funnel = analytics?.funnel || [];
  const monthlyTrend = analytics?.monthlyTrend || [];
  const topDeals = analytics?.topDeals || [];
  const recentActivities = analytics?.recentActivities || [];

  // Max value for monthly chart scaling
  const maxMonthlyRevenue = Math.max(...monthlyTrend.map((m) => m.won_revenue), 10000);

  return (
    <div className="page-container">
      {/* Title */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Sales Analytics & Intelligence</h1>
          <p className="page-subtitle">
            Track revenue velocity, conversion funnels, and pipeline performance metrics.
          </p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="metrics-grid">
        {/* Total Pipeline Volume */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Pipeline Value</span>
            <DollarSign size={18} color="var(--primary)" />
          </div>
          <div className="metric-value">
            ${Number(stats.totalPipelineValue || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Across {stats.totalDeals || 0} total deals
          </span>
        </div>

        {/* Closed Won Revenue */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Won Revenue</span>
            <Award size={18} color="var(--accent-emerald)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-emerald)' }}>
            ${Number(stats.totalWonValue || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {stats.totalWonDeals || 0} deal(s) closed won
          </span>
        </div>

        {/* Win Rate */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Win Rate</span>
            <Target size={18} color="var(--accent-amber)" />
          </div>
          <div className="metric-value" style={{ color: 'var(--accent-amber)' }}>
            {stats.winRate || 0}%
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Closed opportunity conversion
          </span>
        </div>

        {/* Average Deal Size */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Avg. Deal Size</span>
            <TrendingUp size={18} color="var(--accent-cyan)" />
          </div>
          <div className="metric-value">
            ${Number(stats.avgDealSize || 0).toLocaleString()}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            Average revenue per contract
          </span>
        </div>

        {/* Total Contacts */}
        <div className="metric-card">
          <div className="metric-header">
            <span>Total Contacts</span>
            <Users size={18} color="var(--secondary)" />
          </div>
          <div className="metric-value">
            {stats.totalContacts || 0}
          </div>
          <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
            {stats.customersCount || 0} active customers • {stats.leadsCount || 0} leads
          </span>
        </div>
      </div>

      {/* Visual Funnel & Monthly Revenue Trend Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '22px', marginBottom: '28px' }}>
        {/* Stage Conversion Funnel */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--primary)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Pipeline Stage Funnel</h3>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Deals & Volume Distribution</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {funnel.map((item, index) => {
              const stageColors = {
                New: 'var(--stage-new)',
                Contacted: 'var(--stage-contacted)',
                Qualified: 'var(--stage-qualified)',
                Won: 'var(--stage-won)',
                Lost: 'var(--stage-lost)'
              };
              const color = stageColors[item.stage] || 'var(--primary)';
              const percentage = stats.totalPipelineValue > 0 
                ? Math.round((item.value / stats.totalPipelineValue) * 100) 
                : 0;

              return (
                <div key={item.stage}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.84rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{item.stage}</span>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>{item.count} deal(s)</span>
                      <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>${item.value.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: 'var(--bg-surface)', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(percentage, 4)}%`,
                        height: '100%',
                        background: color,
                        borderRadius: '9999px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deals Won Trend / Revenue Chart */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={18} color="var(--accent-emerald)" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Deals Won Per Month</h3>
            </div>
            <span style={{ fontSize: '0.76rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>Closed Revenue</span>
          </div>

          <div style={{ height: '180px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '12px', padding: '10px 0 0', borderBottom: '1px solid var(--border-color)' }}>
            {monthlyTrend.map((m, idx) => {
              const heightPercent = maxMonthlyRevenue > 0 ? (m.won_revenue / maxMonthlyRevenue) * 100 : 0;
              return (
                <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: m.won_revenue > 0 ? 'var(--accent-emerald)' : 'transparent', marginBottom: '4px' }}>
                    ${m.won_revenue > 0 ? `${Math.round(m.won_revenue / 1000)}k` : '0'}
                  </span>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '36px',
                      height: `${Math.max(heightPercent, 6)}%`,
                      background: m.won_revenue > 0 ? 'linear-gradient(180deg, var(--accent-emerald), #059669)' : 'var(--bg-surface)',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.5s ease',
                      boxShadow: m.won_revenue > 0 ? '0 4px 12px rgba(16, 185, 129, 0.25)' : 'none'
                    }}
                    title={`${m.label}: $${m.won_revenue.toLocaleString()} (${m.won_count} deals won)`}
                  />
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '8px', fontWeight: 600 }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Row: Top Deals & Recent Activity Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '22px' }}>
        {/* Top Open Deals */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
            Top Active Opportunities
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topDeals.map((deal) => (
              <div
                key={deal.id}
                onClick={() => openDealModal(deal)}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s ease'
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>{deal.title}</div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {deal.contact_name ? `${deal.contact_name} (${deal.contact_company || 'Account'})` : 'No contact'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                    ${Number(deal.value || 0).toLocaleString()}
                  </div>
                  <span className={`badge badge-status ${deal.stage}`} style={{ fontSize: '0.68rem', padding: '2px 6px' }}>
                    {deal.stage}
                  </span>
                </div>
              </div>
            ))}

            {topDeals.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                No active open deals recorded.
              </div>
            )}
          </div>
        </div>

        {/* Live Activity Feed */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-lg)', padding: '22px' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, marginBottom: '14px' }}>
            Recent CRM Activity
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivities.map((act) => (
              <div key={act.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.84rem' }}>
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: act.type === 'ai_assist' ? 'rgba(236, 72, 153, 0.15)' : 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: act.type === 'ai_assist' ? '#ec4899' : 'var(--primary)',
                    flexShrink: 0
                  }}
                >
                  {act.type === 'ai_assist' ? <Sparkles size={14} /> : <Activity size={14} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{act.title}</div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>{act.description}</p>
                </div>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-subtle)', whiteSpace: 'nowrap' }}>
                  {new Date(act.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}

            {recentActivities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                No recent activity logged yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
