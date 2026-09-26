import React, { useState } from 'react';
import { Plus, DollarSign, Layers } from 'lucide-react';
import { DealCard } from './DealCard';
import { useCRM } from '../../context/CRMContext';

export function KanbanColumn({ 
  stage, 
  deals, 
  onDropDeal, 
  draggedDealId, 
  onDragStart, 
  onDragEnd 
}) {
  const { openDealModal } = useCRM();
  const [isDragOver, setIsDragOver] = useState(false);

  const stageTotalValue = deals.reduce((acc, d) => acc + (Number(d.value) || 0), 0);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (!isDragOver) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    // Only reset if we left the column container
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const dealId = Number(e.dataTransfer.getData('text/plain') || draggedDealId);
    if (dealId) {
      onDropDeal(dealId, stage);
    }
  };

  return (
    <div
      className={`kanban-column ${isDragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      id={`kanban-column-${stage.toLowerCase()}`}
    >
      {/* Column Header */}
      <div className="kanban-column-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className={`stage-dot ${stage}`} />
          <span className="stage-pill" style={{ color: 'var(--text-main)' }}>
            {stage}
          </span>
          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              padding: '2px 7px',
              borderRadius: '10px',
              background: 'var(--bg-surface)',
              color: 'var(--text-muted)'
            }}
          >
            {deals.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
            ${stageTotalValue.toLocaleString()}
          </span>
          <button
            className="btn btn-ghost btn-icon btn-sm"
            onClick={() => openDealModal(null, stage)}
            title={`Add deal to ${stage}`}
            id={`add-deal-stage-${stage.toLowerCase()}`}
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      {/* Cards List / Drop Target */}
      <div className="kanban-cards-list">
        {deals.map((deal) => (
          <DealCard
            key={deal.id}
            deal={deal}
            isDragging={draggedDealId === deal.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
          />
        ))}

        {deals.length === 0 && (
          <div
            style={{
              padding: '30px 16px',
              textAlign: 'center',
              color: 'var(--text-subtle)',
              fontSize: '0.82rem',
              border: '1px dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              margin: 'auto 0'
            }}
          >
            <p>No deals in {stage}</p>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openDealModal(null, stage)}
              style={{ marginTop: '8px', fontSize: '0.75rem' }}
            >
              + Create Deal
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
