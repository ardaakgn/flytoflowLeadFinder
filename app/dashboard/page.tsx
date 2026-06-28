'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import SearchForm from '@/components/SearchForm';
import FilterBar from '@/components/FilterBar';
import LeadTable, { Lead } from '@/components/LeadTable';
import { Terminal, ListFilter, FileSpreadsheet, TrendingDown, Users, Globe, Star } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Scraper running state
  const [searching, setSearching] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Leads data state
  const [leads, setLeads] = useState<Lead[]>([]);
  const [currentSearchInfo, setCurrentSearchInfo] = useState<{ query: string; location: string } | null>(null);

  // Filter states
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [maxRating, setMaxRating] = useState<number | null>(null);

  // Authenticate user check
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        // Load user's latest search on page load
        fetchLatestSearchLeads(session.user.id);
      }
      setLoadingUser(false);
    };
    checkUser();
  }, [router]);

  // Fetch the latest search session leads
  const fetchLatestSearchLeads = async (userId: string) => {
    try {
      // Find the last search record
      const { data: searches, error: searchErr } = await supabase
        .from('searches')
        .select('id, query, location')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1);

      if (searchErr) throw searchErr;

      if (searches && searches.length > 0) {
        const lastSearch = searches[0];
        setCurrentSearchInfo({ query: lastSearch.query, location: lastSearch.location });

        // Fetch leads for that search ID
        const { data: leadsData, error: leadsErr } = await supabase
          .from('leads')
          .select('id, name, category, address, website, rating, review_count, phone, maps_url, email, facebook, instagram')
          .eq('search_id', lastSearch.id)
          .order('name', { ascending: true });

        if (leadsErr) throw leadsErr;
        setLeads(leadsData || []);
      }
    } catch (err: any) {
      console.error('Error fetching latest leads:', err.message || err);
    }
  };

  // Triggers the background search via our Next API route
  const handleSearch = async (query: string, location: string, maxResults: number) => {
    setSearching(true);
    setStatusMsg('Apify Google Maps Scraper tetikleniyor...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ query, location, maxResults }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.error || 'Arama işlemi sırasında bir hata oluştu');
      }

      setStatusMsg('Veriler başarıyla alındı ve kaydedildi. Dashboard güncelleniyor...');

      // Reload leads for this search session
      setCurrentSearchInfo({ query, location });
      if (resData.searchId) {
        const { data: leadsData, error: leadsErr } = await supabase
          .from('leads')
          .select('id, name, category, address, website, rating, review_count, phone, maps_url, email, facebook, instagram')
          .eq('search_id', resData.searchId)
          .order('name', { ascending: true });

        if (leadsErr) throw leadsErr;
        setLeads(leadsData || []);
      }
    } catch (err: any) {
      alert(err.message || 'Scraper çalıştırılırken bir hata oluştu.');
    } finally {
      setSearching(false);
      setStatusMsg('');
    }
  };

  // Filter client-side
  const filteredLeads = leads.filter((lead) => {
    // Website filter
    if (onlyNoWebsite && lead.website) {
      return false;
    }
    // Rating filter
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

      <main className="container" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Title */}
        <div>
          <h1>Müşteri Keşif Paneli</h1>
          <p className="description">
            Google Haritalar üzerinden işletmeleri tarayın ve dijital iyileştirmeye ihtiyaç duyan potansiyel müşterileri bulun.
          </p>
        </div>

        {/* Search form */}
        <SearchForm onSearch={handleSearch} isLoading={searching} />

        {/* Searching Status Panel */}
        {searching && (
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: '4px solid var(--primary)', padding: '1rem 1.5rem', borderRadius: 'var(--radius-md)' }}>
            <div className="flex" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>
              {statusMsg}
            </div>
          </div>
        )}

        {/* Leads and Filters section */}
        {leads.length > 0 && !searching && (() => {
          const totalLeads = leads.length;
          const noWebsiteCount = leads.filter(l => !l.website).length;
          const lowRatingCount = leads.filter(l => l.rating !== null && l.rating <= 3.5).length;
          const avgRating = leads.filter(l => l.rating !== null).length
            ? (leads.filter(l => l.rating !== null).reduce((sum, item) => sum + Number(item.rating || 0), 0) / leads.filter(l => l.rating !== null).length).toFixed(1)
            : '—';

          const handleExport = () => {
            const headers = ['İşletme Adı', 'Kategori', 'Konum', 'Yıldız', 'Yorum Sayısı', 'Web Sitesi'];
            const rows = filteredLeads.map(lead => [
              lead.name,
              lead.category || '',
              lead.address || '',
              lead.rating !== null ? lead.rating.toString() : 'Değerlendirilmemiş',
              lead.review_count !== null ? lead.review_count.toString() : '0',
              lead.website || 'Yok'
            ]);
            const content = [headers, ...rows].map(row => row.join('\t')).join('\n');
            navigator.clipboard.writeText(content);
            alert('Lead listesi Excel/Tablo uyumlu formatta panoya kopyalandı! Excel veya Google Sheets sayfanıza yapıştırabilirsiniz.');
          };

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Minimal Statistics Bar */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', flexWrap: 'wrap', backgroundColor: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', padding: '0.75rem 1rem', fontSize: '0.825rem', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Toplam Lead:</span>
                  <strong style={{ color: 'var(--foreground)' }}>{totalLeads}</strong>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)', height: '14px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Web Sitesi Olmayan:</span>
                  <strong style={{ color: 'var(--error)' }}>{noWebsiteCount} ({((noWebsiteCount / totalLeads) * 100).toFixed(0)}%)</strong>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)', height: '14px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Düşük Puanlı (≤ 3.5):</span>
                  <strong style={{ color: 'var(--error)' }}>{lowRatingCount}</strong>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border)', height: '14px' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Ortalama Puan:</span>
                  <strong style={{ color: 'var(--success)' }}>{avgRating}</strong>
                </div>
              </div>

              {/* Title and actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem' }}>
                    Arama Sonuçları: <span style={{ color: 'var(--primary)' }}>"{currentSearchInfo?.query}"</span> - {currentSearchInfo?.location}
                  </h2>
                  <p className="description" style={{ fontSize: '0.85rem' }}>
                    Toplam {leads.length} kayıttan {filteredLeads.length} tanesi gösteriliyor.
                  </p>
                </div>

                <button
                  onClick={handleExport}
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                >
                  <FileSpreadsheet size={16} /> Panoya Kopyala (Excel)
                </button>
              </div>

              {/* Client filters */}
              <FilterBar
                onlyNoWebsite={onlyNoWebsite}
                setOnlyNoWebsite={setOnlyNoWebsite}
                maxRating={maxRating}
                setMaxRating={setMaxRating}
                onClearFilters={clearFilters}
              />

              {/* Leads Table */}
              <LeadTable leads={filteredLeads} />
            </div>
          );
        })()}

        {leads.length === 0 && !searching && (
          <div className="card text-center" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Terminal size={48} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Henüz bir arama yapılmadı</h3>
            <p className="description" style={{ maxWidth: '480px' }}>
              Yukarıdaki form aracılığıyla sektör ve bölge girerek yeni bir Google Haritalar taraması başlatın. Bulunan sonuçlar burada listelenecektir.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
