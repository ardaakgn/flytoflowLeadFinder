'use client';

import React, { useState } from 'react';
import { Star, Globe, MapPin, Building, EyeOff, X, Copy, Check, Phone, Mail, Map, FileSpreadsheet } from 'lucide-react';

export interface Lead {
  id: string;
  name: string;
  category: string | null;
  address: string | null;
  website: string | null;
  rating: number | null;
  review_count: number | null;
  phone?: string | null;
  maps_url?: string | null;
  email?: string | null;
  facebook?: string | null;
  instagram?: string | null;
}

interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Checkbox states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  if (leads.length === 0) {
    return (
      <div className="card text-center" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <EyeOff size={48} style={{ color: 'var(--text-muted)' }} />
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Sonuç Bulunamadı</h3>
        <p className="description" style={{ maxWidth: '360px', fontSize: '0.85rem' }}>
          Belirtilen filtrelere uygun işletme bulunamadı. Filtreleri temizlemeyi veya yeni bir arama yapmayı deneyin.
        </p>
      </div>
    );
  }

  // Handle single checkbox toggle
  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid triggering row selection details
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  // Handle master select/deselect
  const toggleSelectAll = () => {
    if (selectedIds.size === leads.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(leads.map(l => l.id)));
    }
  };

  // Copy selected leads to clipboard
  const handleCopySelected = () => {
    const targetLeads = selectedIds.size > 0 ? leads.filter(l => selectedIds.has(l.id)) : leads;
    const headers = ['İşletme Adı', 'Kategori', 'Konum', 'Yıldız', 'Yorum Sayısı', 'Web Sitesi', 'Telefon', 'E-posta'];
    const rows = targetLeads.map(lead => [
      lead.name,
      lead.category || '',
      lead.address || '',
      lead.rating !== null ? lead.rating.toString() : 'Değerlendirilmemiş',
      lead.review_count !== null ? lead.review_count.toString() : '0',
      lead.website || 'Yok',
      lead.phone || '',
      lead.email || ''
    ]);
    const content = [headers, ...rows].map(row => row.join('\t')).join('\n');
    navigator.clipboard.writeText(content);
    alert(selectedIds.size > 0 
      ? `Seçilen ${selectedIds.size} adet işletme panoya kopyalandı! Excel veya Google Sheets sayfanıza yapıştırabilirsiniz.` 
      : 'Tüm listelenen işletmeler panoya kopyalandı! Excel veya Google Sheets sayfanıza yapıştırabilirsiniz.'
    );
  };

  const handleCopyText = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    if (fieldName === 'pitch') {
      setCopiedPitch(true);
      setTimeout(() => setCopiedPitch(false), 2000);
    } else {
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const getPitchMessage = (lead: Lead) => {
    if (!lead.website) {
      return `${lead.name} zincirinin/şubesinin web sitesi bulunmuyor — merkeze tek outreach ile web tasarım veya online rezervasyon otomasyonu anlaşması getirebilir.`;
    }
    if (lead.rating !== null && lead.rating <= 3.5) {
      return `${lead.name} düşük puana (${lead.rating.toFixed(1)}) sahip — olumsuz yorumları azaltmak ve otomatik itibar kazanmak için müşteri memnuniyeti sistemi kurulabilir.`;
    }
    return `${lead.name} yüksek puana sahip — WhatsApp entegrasyonu ve rezervasyon hatırlatıcı otomasyonlar ile operasyonel verimlilik artışı sağlanabilir.`;
  };

  const getSidebarStats = (lead: Lead) => {
    const sectorVal = lead.category ? Math.min(lead.category.length, 9) : 5;
    const accessVal = lead.website ? 1 : 0;
    const signalVal = !lead.website ? 8 : (lead.rating && lead.rating <= 3.5 ? 6 : 3);
    return { sectorVal, accessVal, signalVal };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
      {/* Selected Items Copy Panel */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
          {selectedIds.size > 0 ? `${selectedIds.size} satır seçildi` : 'Tüm satırlar kopyalanacak'}
        </span>
        <button
          onClick={handleCopySelected}
          className="btn btn-secondary"
          style={{ height: '32px', padding: '0 0.75rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
        >
          <FileSpreadsheet size={12} /> {selectedIds.size > 0 ? 'Seçilenleri Excel Kopyala' : 'Tümünü Excel Kopyala'}
        </button>
      </div>

      {/* Split layout container */}
      <div style={{ display: 'flex', gap: '1.5rem', width: '100%', alignItems: 'flex-start', flexWrap: 'nowrap' }} className="table-split-container">
        
        {/* Table Side */}
        <div style={{ flex: selectedLead ? '1 1 60%' : '1 1 100%', minWidth: '320px', transition: 'var(--transition)' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--background)', borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '0.85rem 1.25rem', width: '40px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === leads.length && leads.length > 0}
                        onChange={toggleSelectAll}
                        style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                      />
                    </th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>İşletme Adı</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Kategori</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Puan</th>
                    <th style={{ padding: '0.85rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>Web Sitesi</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, index) => {
                    const isSelected = selectedLead?.id === lead.id;
                    const isChecked = selectedIds.has(lead.id);
                    return (
                      <tr
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        style={{
                          borderBottom: index === leads.length - 1 ? 'none' : '1px solid var(--border)',
                          transition: 'var(--transition)',
                          cursor: 'pointer',
                          backgroundColor: isSelected ? 'var(--primary-light)' : 'transparent'
                        }}
                        className="table-row"
                      >
                        {/* Checkbox */}
                        <td style={{ padding: '1rem 1.25rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => toggleSelect(lead.id, e as any)}
                            style={{ cursor: 'pointer', width: '15px', height: '15px' }}
                          />
                        </td>

                        {/* Name */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <Building size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{lead.name}</span>
                          </div>
                        </td>

                        {/* Category */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          {lead.category || '—'}
                        </td>

                        {/* Rating */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.85rem' }}>
                          {lead.rating ? (
                            <span style={{ color: lead.rating <= 3.5 ? 'var(--error)' : (lead.rating >= 4.5 ? 'var(--success)' : 'var(--foreground)'), fontWeight: 600 }}>
                              {lead.rating.toFixed(1)} <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400 }}>({lead.review_count || 0})</span>
                            </span>
                          ) : '—'}
                        </td>

                        {/* Website Button Link */}
                        <td style={{ padding: '1rem 1.25rem', fontSize: '0.8rem' }} onClick={(e) => e.stopPropagation()}>
                          {lead.website ? (
                            <a
                              href={lead.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-primary web-var-btn"
                              style={{
                                display: 'inline-block',
                                padding: '0.2rem 0.5rem',
                                color: '#ffffff',
                                backgroundColor: 'var(--primary)',
                                textDecoration: 'none',
                                borderRadius: '4px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                textAlign: 'center',
                                transition: 'var(--transition)'
                              }}
                            >
                              Var
                            </a>
                          ) : (
                            <span style={{ color: 'var(--error)', fontWeight: 600 }}>Yok</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Details Side */}
        {selectedLead && (
          <div style={{ flex: '0 0 380px', width: '380px', position: 'sticky', top: '90px' }} className="details-sidebar-container">
            <div 
              style={{
                backgroundColor: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: '1.5rem',
                color: 'var(--foreground)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                boxShadow: 'var(--shadow)'
              }}
              className="details-sidebar animate-fade-in"
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: 'var(--foreground)' }}>
                      {selectedLead.name}
                    </h3>
                    {selectedLead.rating && (
                      <span style={{
                        backgroundColor: '#eab308',
                        color: '#000000',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.15rem 0.4rem',
                        borderRadius: '4px'
                      }}>
                        {selectedLead.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {selectedLead.category || 'Belirtilmemiş'} • {selectedLead.address?.split(',')[1] || selectedLead.address || ''}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  style={{
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: '0.2rem'
                  }}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Banner Outreach Text */}
              <div style={{
                borderLeft: '3px solid var(--primary)',
                backgroundColor: 'var(--primary-light)',
                padding: '0.85rem 1rem',
                borderRadius: '4px',
                fontSize: '0.825rem',
                lineHeight: '1.4',
                color: 'var(--foreground)'
              }}>
                {getPitchMessage(selectedLead)}
              </div>

              {/* Metric Boxes */}
              {(() => {
                const stats = getSidebarStats(selectedLead);
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', textAlign: 'center' }}>
                    <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>SEKTÖR</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--foreground)' }}>{stats.sectorVal}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>ERİŞİM</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--foreground)' }}>{stats.accessVal}</div>
                    </div>
                    <div style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', padding: '0.6rem', borderRadius: '8px' }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600 }}>SİNYAL</div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: '0.15rem', color: 'var(--foreground)' }}>{stats.signalVal}</div>
                    </div>
                  </div>
                );
              })()}

              {/* Metrics definitions explanation */}
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                <div>• <strong>SEKTÖR:</strong> Kategorinin harita pazar yoğunluğu ve arama gücü değeri.</div>
                <div>• <strong>ERİŞİM:</strong> Web sitesi varlığı (Var ise 1, Yok ise 0).</div>
                <div>• <strong>SİNYAL:</strong> Otomasyon satış potansiyeli önceliği (Yüksek: 8, Düşük: 3).</div>
              </div>

              {/* Contact list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.825rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Email</span>
                  {selectedLead.email ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: 'var(--info)' }}>{selectedLead.email}</span>
                      <button onClick={() => handleCopyText(selectedLead.email!, 'email')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {copiedField === 'email' ? 'kopyalandı' : 'kopyala'}
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Telefon</span>
                  {selectedLead.phone ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: 'var(--success)' }}>{selectedLead.phone}</span>
                      <button onClick={() => handleCopyText(selectedLead.phone!, 'phone')} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        {copiedField === 'phone' ? 'kopyalandı' : 'kopyala'}
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Website</span>
                  {selectedLead.website ? (
                    <a href={selectedLead.website} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--info)', textDecoration: 'none' }}>
                      {selectedLead.website.replace('https://', '').replace('http://', '').replace('www.', '')}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                  )}
                </div>

                <div 
                  onClick={() => selectedLead.address && handleCopyText(selectedLead.address, 'address')} 
                  style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem', cursor: selectedLead.address ? 'pointer' : 'default' }}
                  title={selectedLead.address ? 'Kopyalamak için tıklayın' : ''}
                >
                  <span style={{ color: 'var(--text-muted)' }}>Adres</span>
                  <span style={{ color: 'var(--foreground)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {selectedLead.address || '—'} {copiedField === 'address' && <span style={{ color: 'var(--primary)', fontSize: '0.75rem', marginLeft: '0.25rem' }}>(kopyalandı)</span>}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: '0.5rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Puan / Yorum</span>
                  {selectedLead.maps_url ? (
                    <a 
                      href={selectedLead.maps_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={{ color: 'var(--info)', textDecoration: 'none', fontWeight: 600 }}
                      title="Google Haritalar'da Aç"
                    >
                      {selectedLead.rating ? `${selectedLead.rating.toFixed(1)} ★ - ${selectedLead.review_count || 0} yorum` : 'Haritada Aç ↗'}
                    </a>
                  ) : (
                    <span style={{ color: 'var(--foreground)' }}>
                      {selectedLead.rating ? `${selectedLead.rating.toFixed(1)} ★ - ${selectedLead.review_count || 0} yorum` : '—'}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <a
                  href={selectedLead.email ? `mailto:${selectedLead.email}` : '#'}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: selectedLead.email ? 'var(--foreground)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: selectedLead.email ? 'pointer' : 'not-allowed',
                    pointerEvents: selectedLead.email ? 'auto' : 'none'
                  }}
                >
                  ✉ Mail at
                </a>

                <a
                  href={selectedLead.phone ? `tel:${selectedLead.phone}` : '#'}
                  className="btn"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: selectedLead.phone ? 'var(--foreground)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: selectedLead.phone ? 'pointer' : 'not-allowed',
                    pointerEvents: selectedLead.phone ? 'auto' : 'none'
                  }}
                >
                  📞 Ara
                </a>

                <a
                  href={selectedLead.website || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn"
                  style={{
                    backgroundColor: 'var(--background)',
                    color: selectedLead.website ? 'var(--foreground)' : 'var(--text-muted)',
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    textAlign: 'center',
                    cursor: selectedLead.website ? 'pointer' : 'not-allowed',
                    pointerEvents: selectedLead.website ? 'auto' : 'none'
                  }}
                >
                  🌐 Site
                </a>

                <button
                  onClick={() => handleCopyText(getPitchMessage(selectedLead), 'pitch')}
                  className="btn btn-primary"
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff'
                  }}
                >
                  {copiedPitch ? 'Kopyalandı' : '💾 Satın kopyala'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style jsx global>{`
        .table-row:hover {
          background-color: var(--primary-light) !important;
        }
        .web-var-btn:hover {
          background-color: var(--primary-hover) !important;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fadeIn 0.15s ease-out forwards;
        }
        @media (max-width: 1024px) {
          .table-split-container {
            flex-wrap: wrap !important;
          }
          .details-sidebar-container {
            flex: 1 1 100% !important;
            width: 100% !important;
            position: relative !important;
            top: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
