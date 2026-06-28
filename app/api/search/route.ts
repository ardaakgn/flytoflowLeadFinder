import { NextResponse } from 'next/server';
import { runScraper } from '@/lib/apify';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkilendirme başlığı eksik veya geçersiz' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Supabase yapılandırması eksik' }, { status: 500 });
    }

    // Verify token and get user
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Geçersiz oturum' }, { status: 401 });
    }

    const body = await req.json();
    const { query, location, maxResults } = body;

    if (!query || !location || !maxResults) {
      return NextResponse.json({ error: 'Eksik parametreler (query, location, maxResults)' }, { status: 400 });
    }

    // Trigger Apify Scraper
    const scraperResults = await runScraper(query, location, Number(maxResults));

    // Save search details under the authenticated user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    const { data: searchData, error: searchError } = await userClient
      .from('searches')
      .insert({
        user_id: user.id,
        query,
        location,
      })
      .select()
      .single();

    if (searchError) {
      return NextResponse.json({ error: `Arama kaydı oluşturulamadı: ${searchError.message}` }, { status: 500 });
    }

    // Build lead rows
    const leadsToInsert = scraperResults.map(item => ({
      search_id: searchData.id,
      name: item.title || 'Bilinmeyen İşletme',
      category: item.categoryName || null,
      address: item.address || null,
      website: item.website || null,
      rating: item.totalScore !== undefined ? item.totalScore : null,
      review_count: item.reviewsCount !== undefined ? item.reviewsCount : null,
      phone: item.phone || item.phoneNumber || null,
      maps_url: item.url || item.googleMapsUrl || null,
      email: item.email || item.contactEmail || null,
      facebook: item.facebook || item.facebookUrl || null,
      instagram: item.instagram || item.instagramUrl || null,
    }));

    if (leadsToInsert.length > 0) {
      const { error: leadsError } = await userClient
        .from('leads')
        .insert(leadsToInsert);

      if (leadsError) {
        // Cleanup the search query if leads fail to insert so we don't have dangling empty searches
        await userClient.from('searches').delete().eq('id', searchData.id);
        return NextResponse.json({ error: `Lead kayıtları eklenemedi: ${leadsError.message}` }, { status: 500 });
      }
    }

    return NextResponse.json({ 
      success: true, 
      searchId: searchData.id, 
      resultsCount: leadsToInsert.length 
    });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Sunucu hatası oluştu' }, { status: 500 });
  }
}
