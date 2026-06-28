'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import LeadTable, { Lead } from '@/components/LeadTable';
import FilterBar from '@/components/FilterBar';
import { Calendar, Trash2, Search, CornerDownRight, History, ArrowRight } from 'lucide-react';

interface SearchSession {
  id: string;
  query: string;
  location: string;
  created_at: string;
}

export const dynamic = 'force-dynamic';

export default function HistoryPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [sessions, setSessions] = useState<SearchSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SearchSession | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(false);

  // Filters for the selected session
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [maxRating, setMaxRating] = useState<number | null>(null);

  // Authenticate & Load session list
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchSessions(session.user.id);
      }
      setLoadingUser(false);
    };
    checkUser();
  }, [router]);

  // Load search sessions
  const fetchSessions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('searches')
        .select('id, query, location, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (err: any) {
      console.error('Error fetching sessions:', err.message || err);
    }
  };

  // Load leads for selected session
  const handleSelectSession = async (session: SearchSession) => {
    setSelectedSession(session);
    setLoadingLeads(true);
    setOnlyNoWebsite(false);
    setMaxRating(null);

    try {
      const { data, error } = await supabase
        .from('leads')
        .select('id, name, category, address, website, rating, review_count, phone, maps_url, email, facebook, instagram')
        .eq('search_id', session.id)
        .order('name', { ascending: true });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error('Error fetching leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Delete search session
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation(); // Avoid triggering select
    if (!confirm('Bu arama geçmişini ve ilgili tüm müşteri kayıtlarını silmek istediğinize emin misiniz?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('searches')
        .delete()
        .eq('id', sessionId);

      if (error) throw error;

      // Update sessions state
      setSessions(sessions.filter(s => s.id !== sessionId));

      // If deleted session was selected, clear it
      if (selectedSession?.id === sessionId) {
        setSelectedSession(null);
        setLeads([]);
      }
    } catch (err: any) {
      alert(`Silme işlemi başarısız: ${err.message}`);
    }
  };

  // Filter leads client-side
  const filteredLeads = leads.filter((lead) => {
    if (onlyNoWebsite && lead.website) {
      return false;
    }
    if (maxRating !== null) {
      if (lead.rating === null || lead.rating > maxRating) {
        return false;
      }
    }
    return true;
  });

  const clearFilters = () => {
    setOnlyNoWebsite(false);
    setMaxRating(null);
  };

  // Format date nicely
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loadingUser || !user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: 'var(--background)' }}>
        <p className="description">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Header />

      <main className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '2rem' }}>
        {/* Title */}
        <div style={{ gridColumn: 'span 12' }}>
          <h1>Geçmiş Aramalar</h1>
          <p className="description">Daha önce gerçekleştirdiğiniz tarama oturumlarını inceleyin ve kaydedilen lead listelerine gözatın.</p>
        </div>

        {/* Sidebar - Sessions List */}
        <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="col-sidebar">
          <div className="card" style={{ padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={16} /> Arama Oturumları
            </h3>

            {sessions.length === 0 ? (
              <p className="description" style={{ fontSize: '0.85rem', textAlign: 'center', padding: '2rem 0' }}>
                Henüz arama kaydı yok.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {sessions.map((sess) => {
                  const isSelected = selectedSession?.id === sess.id;
                  return (
                    <div
                      key={sess.id}
                      onClick={() => handleSelectSession(sess)}
                      style={{
                        padding: '0.75rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
                        cursor: 'pointer',
                        transition: 'var(--transition)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.35rem',
                        position: 'relative'
                      }}
                      className="session-item"
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: '1.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelected ? 'var(--primary-hover)' : 'var(--foreground)' }}>
                          {sess.query}
                        </span>
                        <button
                          onClick={(e) => handleDeleteSession(e, sess.id)}
                          style={{
                            border: 'none',
                            background: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--text-muted)',
                            padding: '0.2rem',
                            borderRadius: '4px',
                            transition: 'var(--transition)',
                            position: 'absolute',
                            right: '0.5rem',
                            top: '0.75rem'
                          }}
                          className="delete-btn"
                          title="Geçmişi Sil"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {sess.location}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Calendar size={12} /> {formatDate(sess.created_at)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Content Area - Leads List */}
        <div style={{ gridColumn: 'span 12', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="col-content">
          {selectedSession ? (
            <>
              {/* Selected header details */}
              <div className="card" style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--primary)', letterSpacing: '0.05em' }}>
                  Seçili Oturum Detayı
                </span>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>
                  {selectedSession.query} - <span style={{ color: 'var(--text-muted)' }}>{selectedSession.location}</span>
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <span>Tarih: {formatDate(selectedSession.created_at)}</span>
                  <span>•</span>
                  <span>Kayıt Sayısı: {leads.length}</span>
                </div>
              </div>

              {/* Filters */}
              {leads.length > 0 && !loadingLeads && (
                <FilterBar
                  onlyNoWebsite={onlyNoWebsite}
                  setOnlyNoWebsite={setOnlyNoWebsite}
                  maxRating={maxRating}
                  setMaxRating={setMaxRating}
                  onClearFilters={clearFilters}
                />
              )}

              {/* Leads Table */}
              {loadingLeads ? (
                <div className="card text-center" style={{ padding: '4rem 0' }}>
                  <p className="description">Yükleniyor...</p>
                </div>
              ) : (
                <LeadTable leads={filteredLeads} />
              )}
            </>
          ) : (
            <div className="card text-center" style={{ padding: '6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', height: '100%', justifyContent: 'center' }}>
              <CornerDownRight size={48} style={{ color: 'var(--text-muted)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Oturum Seçilmedi</h3>
              <p className="description" style={{ maxWidth: '400px' }}>
                Sol taraftaki listeden incelemek istediğiniz bir arama oturumunu seçerek detayları ve lead kayıtlarını görüntüleyin.
              </p>
            </div>
          )}
        </div>
      </main>

      <style jsx global>{`
        /* Sidebar layout styling */
        @media (min-width: 768px) {
          .col-sidebar {
            grid-column: span 4 !important;
          }
          .col-content {
            grid-column: span 8 !important;
          }
        }
        .session-item:hover {
          background-color: #f8fafc !important;
        }
        .delete-btn:hover {
          color: var(--error) !important;
          background-color: var(--error-light) !important;
        }
      `}</style>
    </div>
  );
}
