# GEMINI.md — Lead Finder Projesi

## Proje Amacı

Bu uygulama, işletmelere otomasyon hizmetleri satan bir freelancer/ajans için potansiyel müşteri (lead) bulma aracıdır. Google Maps üzerinden farklı sektörlerdeki yerel işletmeleri tarar, iletişim ve değerlendirme bilgilerini toplar ve filtreler. Hedef: otomasyon hizmetine ihtiyaç duyabilecek, dijital altyapısı zayıf işletmeleri hızlıca tespit etmek.

## Kullanıcı Problemi

Otomasyon hizmeti sunmak için potansiyel müşteri bulmak zaman alıcı ve manuel bir süreçtir. Bu araç şu soruya cevap verir: **"Hangi işletmelere ulaşmalıyım?"**

Düşük yıldız puanı veya web sitesi eksikliği gibi sinyaller, o işletmenin dijital/operasyonel yardıma ihtiyacı olduğunu gösterir.

---

## Temel Özellikler

### Kullanıcı Sistemi
- E-posta + şifre ile kayıt ol / giriş yap
- Basit auth, Supabase Auth kullanılacak
- Landing page yok — direkt uygulama dashboard'una yönlendirme

### Lead Arama
- Kullanıcı şu parametreleri girer:
  - **Sektör / İşletme türü** (ör: emlak ofisi, restoran, güzellik merkezi)
  - **Şehir veya bölge** (ör: İstanbul Kadıköy)
  - **Maksimum sonuç sayısı**
- Apify üzerinden Google Maps Scraper tetiklenir
- Sonuçlar Supabase'e kaydedilir ve ekranda listelenir

### Listelenen Bilgiler (Her Lead İçin)
| Alan | Açıklama |
|---|---|
| İsim | İşletme adı |
| Kategori | Google Maps kategorisi |
| Konum | Adres / şehir |
| Website | Varsa URL, yoksa "—" |
| Yıldız | 1.0 – 5.0 arası puan |
| Yorum Sayısı | Toplam review count |

### Filtreleme
- **Yıldız filtresi:** Maksimum yıldız eşiği (ör: 3.5 ve altı)
- **Website filtresi:** "Sadece websitesi olmayanları göster" toggle'ı
- Filtreler anlık olarak uygulanır (client-side)

### Kayıtlı Listeler
- Kullanıcı geçmiş aramalarını görebilir
- Her arama oturumu Supabase'de saklanır

---

## Teknik Mimari

### Stack
- **Frontend + Backend:** Next.js (App Router)
- **Veritabanı & Auth:** Supabase
- **Scraping:** Apify — Google Maps Scraper aktörü
- **Hosting:** Standart Node.js ortamı (ör: Railway, Render, VPS)
  - ⚠️ Vercel'e özgü hiçbir özellik kullanılmayacak (`next/headers` server actions dışında, edge runtime yok, ISR yok)

### Klasör Yapısı (Önerilen)
```
/app
  /login         → Giriş sayfası
  /register      → Kayıt sayfası
  /dashboard     → Ana sayfa, arama formu + sonuç listesi
  /history       → Geçmiş aramalar
/components
  LeadTable.tsx
  SearchForm.tsx
  FilterBar.tsx
/lib
  supabase.ts    → Supabase client
  apify.ts       → Apify API çağrısı
/api
  /search        → Apify'ı tetikleyen POST endpoint
```

### Supabase Tabloları

```sql
-- Kullanıcılar Supabase Auth ile yönetilir, ayrı tablo gerekmez

CREATE TABLE searches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  query text,           -- ör: "restoran Kadıköy"
  location text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  search_id uuid REFERENCES searches(id),
  name text,
  category text,
  address text,
  website text,
  rating numeric(2,1),
  review_count integer,
  created_at timestamptz DEFAULT now()
);
```

### Apify Entegrasyonu

- Aktör: `compass/google-maps-scraper` (veya `apify/google-maps-scraper`)
- Çağrı yöntemi: Apify REST API ile `POST /v2/acts/{actorId}/runs`
- Çalışma modu: Senkron run (sonuç gelene kadar bekle) veya webhook
- Dönen veriden şu alanlar alınacak:
  - `title`, `categoryName`, `address`, `website`, `totalScore`, `reviewsCount`

```ts
// lib/apify.ts — örnek yapı
export async function runScraper(query: string, location: string, maxResults: number) {
  const res = await fetch(`https://api.apify.com/v2/acts/compass~google-maps-scraper/run-sync-get-dataset-items?token=${process.env.APIFY_TOKEN}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchStringsArray: [`${query} ${location}`],
      maxCrawledPlacesPerSearch: maxResults,
      language: 'tr',
    }),
  });
  return res.json();
}
```

### Ortam Değişkenleri (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
APIFY_TOKEN=
```

---

## Tasarım Sistemi

### Renkler
| Rol | Renk | Hex |
|---|---|---|
| Primary / Accent | Yeşil | `#52b788` |
| Background | Kırık beyaz | `#f7f7f2` |
| Metin (başlık) | Koyu siyah | `#1a1a1a` |
| Metin (açıklama) | Gri | `#6b7280` |
| Uyarı / Hata | Kırmızı | `#ef4444` |
| Bilgi / Link | Mavi | `#3b82f6` |

### Tipografi
- Sistem fontu kullanılacak (Inter veya system-ui)
- Başlıklar: koyu siyah, orta-büyük
- Açıklama metinleri: gri

### UI Notları
- Dashboard tek sayfa olacak: üstte arama formu, altında tablo
- Tablo satırları sade, okunabilir
- Websitesi olmayanlar kırmızı badge ile işaretlenir
- Düşük yıldız (≤3.5) kırmızı renkte gösterilir
- Yüksek yıldız (≥4.5) yeşil renkte gösterilir

---

## MVP Kapsamı (Geliştirme Sırası)

1. [ ] Supabase projesi kur, tabloları oluştur
2. [ ] Auth sayfaları (login + register)
3. [ ] Dashboard layout + arama formu
4. [ ] Apify entegrasyonu (`/api/search` endpoint)
5. [ ] Sonuçları Supabase'e kaydet ve tabloda göster
6. [ ] Filtreleme (yıldız + website)
7. [ ] Geçmiş aramalar sayfası
8. [ ] Deploy (Railway / Render)

## Kapsam Dışı (MVP'de Yok)
- Email notification
- CSV export (sonradan eklenebilir)
- Çoklu kullanıcı / team özelliği
- Landing page / marketing

---

## Geliştirme Notları

- Apify çağrısı sunucu tarafında yapılacak (API token client'a açılmayacak)
- Supabase RLS (Row Level Security) aktif olacak — kullanıcılar yalnızca kendi aramalarını görecek
- `next/image` ve `next/font` kullanılabilir; `next/headers` sadece server component içinde
- Vercel-specific: `edge`, `revalidate`, `generateStaticParams` gibi şeyler kullanılmayacak
- Tüm API route'ları `app/api/` altında standart Next.js route handler olarak yazılacak
