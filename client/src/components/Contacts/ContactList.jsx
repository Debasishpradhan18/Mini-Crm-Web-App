import React, { useState } from 'react';
import { 
  Users, 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Sparkles, 
  Brain, 
  Mail, 
  Phone, 
  Building2, 
  Edit2, 
  Trash2, 
  MoreHorizontal,
  ChevronRight
} from 'lucide-react';
import { ContactCard } from './ContactCard';
import { useCRM } from '../../context/CRMContext';

const STATUS_TABS = ['All', 'Lead', 'Prospect', 'Customer', 'Inactive'];

export function ContactList() {
  const { 
    contacts, 
    openContactModal, 
    openAIEmailModal, 
    openAISummaryModal, 
    openDrawer, 
    deleteContact,
    searchQuery,
    contactStatusFilter,
    setContactStatusFilter
  } = useCRM();

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [selectedTag, setSelectedTag] = useState('All');
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'name_asc' | 'value_desc'

  // Extract unique tags across all contacts
  const allTags = ['All'];
  contacts.forEach((c) => {
    if (Array.isArray(c.tags)) {
      c.tags.forEach((t) => {
        if (!allTags.includes(t)) allTags.push(t);
      });
    }
  });

  // Filter contacts
  const filteredContacts = contacts.filter((contact) => {
    // Status Filter
    if (contactStatusFilter !== 'All' && contact.status !== contactStatusFilter) {
      return false;
    }
    // Tag Filter
    if (selectedTag !== 'All' && (!contact.tags || !contact.tags.includes(selectedTag))) {
      return false;
    }
    // Search query
    if (searchQuery && searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = contact.name?.toLowerCase().includes(q);
      const matchEmail = contact.email?.toLowerCase().includes(q);
      const matchCompany = contact.company?.toLowerCase().includes(q);
      const matchPhone = contact.phone?.toLowerCase().includes(q);
      const matchTags = contact.tags?.some((t) => t.toLowerCase().includes(q));
      return matchName || matchEmail || matchCompany || matchPhone || matchTags;
    }
    return true;
  });

  // Sort contacts
  const sortedContacts = [...filteredContacts].sort((a, b) => {
    if (sortBy === 'name_asc') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'value_desc') {
      const valA = Number(a.total_pipeline_value || a.value || 0);
      const valB = Number(b.total_pipeline_value || b.value || 0);
      return valB - valA;
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts & Accounts</h1>
          <p className="page-subtitle">
            Manage your customer database, log notes, and run AI follow-up campaigns.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* View Toggle (Grid / Table) */}
          <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '3px' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 10px' }}
              title="Table View"
            >
              <List size={16} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '6px 10px' }}
              title="Grid View"
            >
              <Grid size={16} />
            </button>
          </div>

          <button
            className="btn btn-primary"
            onClick={() => openContactModal()}
            id="add-contact-page-btn"
          >
            <Plus size={16} />
            <span>Add Contact</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs & Tag Selector */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '20px'
        }}
      >
        {/* Status Pill Tabs */}
        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
          {STATUS_TABS.map((status) => {
            const count = status === 'All' 
              ? contacts.length 
              : contacts.filter((c) => c.status === status).length;
            const isActive = contactStatusFilter === status;

            return (
              <button
                key={status}
                onClick={() => setContactStatusFilter(status)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  border: '1px solid',
                  borderColor: isActive ? 'var(--primary)' : 'var(--border-color)',
                  background: isActive ? 'var(--primary-light)' : 'var(--bg-card)',
                  color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{status}</span>
                <span
                  style={{
                    fontSize: '0.72rem',
                    padding: '1px 6px',
                    borderRadius: '8px',
                    background: isActive ? 'var(--primary)' : 'var(--bg-surface)',
                    color: isActive ? '#ffffff' : 'var(--text-subtle)',
                    fontWeight: 700
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tag Filter & Sort */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {allTags.length > 1 && (
            <select
              className="form-select"
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
            >
              {allTags.map((t) => (
                <option key={t} value={t}>{t === 'All' ? 'All Tags' : `#${t}`}</option>
              ))}
            </select>
          )}

          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: 'auto', padding: '6px 12px', fontSize: '0.82rem' }}
          >
            <option value="recent">Sort: Recently Added</option>
            <option value="name_asc">Sort: Name (A-Z)</option>
            <option value="value_desc">Sort: Pipeline Value ($)</option>
          </select>
        </div>
      </div>

      {/* Main View Render */}
      {viewMode === 'grid' ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
          }}
        >
          {sortedContacts.map((contact) => (
            <ContactCard key={contact.id} contact={contact} />
          ))}
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Company & Title</th>
                <th>Status</th>
                <th>Tags</th>
                <th>Pipeline Value</th>
                <th>Deals</th>
                <th style={{ textAlign: 'right' }}>AI Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedContacts.map((contact) => (
                <tr
                  key={contact.id}
                  onClick={() => openDrawer(contact.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {/* Name & Avatar */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={contact.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(contact.name)}`}
                        alt={contact.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{contact.name}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{contact.email || contact.phone || 'No direct contact'}</div>
                      </div>
                    </div>
                  </td>

                  {/* Company & Job Title */}
                  <td>
                    <div style={{ fontWeight: 600 }}>{contact.company || '—'}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{contact.job_title || '—'}</div>
                  </td>

                  {/* Status */}
                  <td>
                    <span className={`badge badge-status ${contact.status || 'Lead'}`}>
                      {contact.status || 'Lead'}
                    </span>
                  </td>

                  {/* Tags */}
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {contact.tags && contact.tags.length > 0 ? (
                        contact.tags.map((t, idx) => (
                          <span key={idx} className="tag-pill">#{t}</span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-subtle)', fontSize: '0.76rem' }}>—</span>
                      )}
                    </div>
                  </td>

                  {/* Pipeline Value */}
                  <td>
                    <span style={{ fontWeight: 800, color: 'var(--accent-emerald)', fontFamily: 'var(--font-heading)' }}>
                      ${Number(contact.total_pipeline_value || contact.value || 0).toLocaleString()}
                    </span>
                  </td>

                  {/* Deals Count */}
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                      {contact.deals_count || 0} deal(s)
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        className="btn btn-ai btn-sm"
                        onClick={() => openAIEmailModal(contact)}
                        title="Draft AI Email"
                        id={`ai-email-table-${contact.id}`}
                      >
                        <Sparkles size={13} />
                        <span>AI Email</span>
                      </button>

                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => openAISummaryModal(contact)}
                        title="AI Summary"
                        id={`ai-summary-table-${contact.id}`}
                      >
                        <Brain size={13} color="var(--primary)" />
                      </button>

                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => openContactModal(contact)}
                        title="Edit Contact"
                      >
                        <Edit2 size={14} />
                      </button>

                      <button
                        className="btn btn-ghost btn-icon btn-sm"
                        onClick={() => {
                          if (window.confirm(`Delete contact "${contact.name}"?`)) {
                            deleteContact(contact.id);
                          }
                        }}
                        title="Delete Contact"
                        style={{ color: 'var(--accent-rose)' }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty State */}
      {sortedContacts.length === 0 && (
        <div
          style={{
            padding: '60px 20px',
            textAlign: 'center',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            marginTop: '20px'
          }}
        >
          <Users size={42} color="var(--text-subtle)" style={{ marginBottom: '12px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '6px' }}>No contacts found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '400px', margin: '0 auto 16px' }}>
            {searchQuery 
              ? `No contacts matched your search "${searchQuery}".`
              : 'Add your first customer contact to begin logging deals and drafting AI follow-up emails.'}
          </p>
          <button
            className="btn btn-primary"
            onClick={() => openContactModal()}
          >
            <Plus size={16} />
            <span>Add New Contact</span>
          </button>
        </div>
      )}
    </div>
  );
}
