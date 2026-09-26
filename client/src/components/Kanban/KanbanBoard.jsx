import React, { useState } from 'react';
import { 
  Filter, 
  Plus, 
  Sparkles, 
  DollarSign, 
  Award, 
  TrendingUp, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { KanbanColumn } from './KanbanColumn';
import { useCRM } from '../../context/CRMContext';

const STAGES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

export function KanbanBoard() {
  const { 
    deals, 
    pipelineSummary, 
    moveDealStage, 
    openDealModal, 
    searchQuery,
    dealPriorityFilter,
    setDealPriorityFilter
  } = useCRM();

  const [draggedDealId, setDraggedDealId] = useState(null);

  // Filter deals based on global search & priority filter
  const filteredDeals = deals.filter((deal) => {
    // Priority filter
    if (dealPriorityFilter !== 'All' && deal.priority !== dealPriorityFilter) {
      return false;
    }
    // Search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = deal.title?.toLowerCase().includes(q);
      const matchContact = deal.contact_name?.toLowerCase().includes(q);
      const matchCompany = deal.contact_company?.toLowerCase().includes(q);
      return matchTitle || matchContact || matchCompany;
    }
    return true;
  });

  const handleDragStart = (dealId) => {
    setDraggedDealId(dealId);
  };

  const handleDragEnd = () => {
    setDraggedDealId(null);
  };

  const handleDropDeal = (dealId, newStage) => {
    moveDealStage(dealId, newStage);
  };

  const totalValue = filteredDeals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);
  const wonValue = filteredDeals.filter(d => d.stage === 'Won').reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  return (
    <div className="page-container">
      {/* Page Title & Top Control Banner */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Deal Pipeline</h1>
          <p className="page-subtitle">
            Manage, progress, and close opportunities across interactive Kanban stages.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Priority Filter Pill Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '4px', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.76rem', fontWeight: 600, color: 'var(--text-muted)', padding: '0 6px' }}>
              Priority:
            </span>
            {['All', 'High', 'Medium', 'Low'].map((p) => (
              <button
                key={p}
                onClick={() => setDealPriorityFilter(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  border: 'none',
                  cursor: 'pointer',
                  background: dealPriorityFilter === p ? 'var(--primary)' : 'transparent',
                  color: dealPriorityFilter === p ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="btn btn-primary"
            onClick={() => openDealModal()}
            id="board-new-deal-btn"
          >
            <Plus size={16} />
            <span>New Deal</span>
          </button>
        </div>
      </div>

      {/* Mini Pipeline Stats Strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '14px',
          marginBottom: '22px'
        }}
      >
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
            <DollarSign size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Filtered Pipeline</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              ${totalValue.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-emerald)' }}>
            <Award size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Won Revenue</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
              ${wonValue.toLocaleString()}
            </div>
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(245, 158, 11, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-amber)' }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Win Rate</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-heading)' }}>
              {pipelineSummary?.metrics?.winRate || 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Kanban Board Container */}
      <div className="kanban-board">
        {STAGES.map((stage) => {
          const stageDeals = filteredDeals.filter((d) => d.stage === stage);
          return (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={stageDeals}
              onDropDeal={handleDropDeal}
              draggedDealId={draggedDealId}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
}
