'use client';

import React from 'react';
import { RotateCcw } from 'lucide-react';

interface FilterBarProps {
  onlyNoWebsite: boolean;
  setOnlyNoWebsite: (val: boolean) => void;
  maxRating: number | null;
  setMaxRating: (val: number | null) => void;
  onClearFilters: () => void;
}

export default function FilterBar({
  onlyNoWebsite,
  setOnlyNoWebsite,
  maxRating,
  setMaxRating,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center', justifyContent: 'space-between', borderRadius: 'var(--radius-md)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', alignItems: 'center' }}>
        
        {/* Website Toggle */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', margin: 0, userSelect: 'none' }}>
          <div style={{ position: 'relative', width: '38px', height: '20px', backgroundColor: onlyNoWebsite ? 'var(--primary)' : '#cbd5e1', borderRadius: '10px', transition: 'var(--transition)' }}>
            <div style={{
              position: 'absolute',
              top: '2px',
              left: onlyNoWebsite ? '20px' : '2px',
              width: '16px',
              height: '16px',
              backgroundColor: '#ffffff',
              borderRadius: '50%',
              transition: 'var(--transition)'
            }} />
          </div>
          <input
            type="checkbox"
            checked={onlyNoWebsite}
            onChange={(e) => setOnlyNoWebsite(e.target.checked)}
            style={{ display: 'none' }}
          />
          <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>
            Sadece Web Sitesi Olmayanlar
          </span>
        </label>

        {/* Divider */}
        <div style={{ width: '1px', height: '18px', backgroundColor: 'var(--border)' }} />

        {/* Rating Filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            Maksimum Puan:
          </span>
          <select
            value={maxRating === null ? '' : maxRating.toString()}
            onChange={(e) => setMaxRating(e.target.value === '' ? null : Number(e.target.value))}
            style={{ width: '140px', padding: '0.4rem 0.6rem', fontSize: '0.8rem', height: '34px' }}
          >
            <option value="">Tümü</option>
            <option value="3.5">3.5 ve Altı</option>
            <option value="4.0">4.0 ve Altı</option>
            <option value="4.5">4.5 ve Altı</option>
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {(onlyNoWebsite || maxRating !== null) && (
        <button
          onClick={onClearFilters}
          className="btn btn-secondary"
          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem', border: '1px dashed var(--border)', height: '34px' }}
        >
          <RotateCcw size={12} /> Filtreleri Temizle
        </button>
      )}
    </div>
  );
}
