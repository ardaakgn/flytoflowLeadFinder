'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import LeadTable, { Lead } from '@/components/LeadTable';
import FilterBar from '@/components/FilterBar';
import { Bookmark, EyeOff, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function SavedPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);

  // Filters for saved leads
  const [onlyNoWebsite, setOnlyNoWebsite] = useState(false);
  const [maxRating, setMaxRating] = useState<number | null>(null);

  // Authenticate & Load saved leads
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
      } else {
        setUser(session.user);
        fetchSavedLeads(session.user.id);
      }
      setLoadingUser(false);
    };
    checkUser();
  }, [router]);

  // Load saved leads from Supabase
  const fetchSavedLeads = async (userId: string) => {
    setLoadingLeads(true);
    try {
      const { data, error } = await supabase
        .from('leads')
        .select(`
          id, name, category, address, website, rating, review_count, phone, maps_url, email, facebook, instagram,
          searches!inner(user_id)
        `)
        .eq('saved', true)
        .eq('searches.user_id', userId)
        .order('name', { ascending: true });

      if (error) throw error;
      setLeads(data || []);
    } catch (err: any) {
      console.error('Error fetching saved leads:', err);
    } finally {
      setLoadingLeads(false);
    }
  };

  // Filter application
  const filteredLeads = leads.filter((lead) => {
    if (onlyNoWebsite && lead.website) return false;
    if (maxRating !== null) {
      if (lead.rating === null || lead.rating > maxRating) return false;
    }
    return true;
  });

  const clearFilters = () => {
    setOnlyNoWebsite(false);
    setMaxRating(null);
  };

  if (loadingUser) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--background)' }}>
        <Loader2 size={32} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header />

      <main className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bookmark size={24} style={{ color: 'var(--primary)' }} />
              Kaydedilen Müşteriler
            </h1>
            <p className="description" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Daha önce kaydettiğiniz potansiyel müşteriler listelenir.
            </p>
          </div>
        </div>

        {loadingLeads ? (
          <div className="card text-center" style={{ padding: '3rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Loader2 size={24} className="animate-spin" style={{ animation: 'spin 1s linear infinite', color: 'var(--primary)' }} />
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Kayıtlar yükleniyor...</p>
          </div>
        ) : leads.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Filter Bar */}
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
        ) : (
          <div className="card text-center" style={{ padding: '4rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <Bookmark size={48} style={{ color: 'var(--text-muted)' }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Henüz kaydedilen müşteri yok</h3>
            <p className="description" style={{ maxWidth: '420px', fontSize: '0.85rem' }}>
              Arama sonuçlarında beğendiğiniz işletmeleri checkbox ile seçerek "Seçilenleri Kaydet" butonu ile buraya ekleyebilirsiniz.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
