'use client';

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

interface SearchFormProps {
  onSearch: (query: string, location: string, maxResults: number) => Promise<void>;
  isLoading: boolean;
}

// 81 Turkey Cities
const cities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Ankara", "Antalya", "Artvin", "Aydın", 
  "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", 
  "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", 
  "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "İstanbul", 
  "İzmir", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", 
  "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", 
  "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", 
  "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", 
  "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", 
  "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
];

// Districts for popular cities
const popularDistricts: Record<string, string[]> = {
  "İstanbul": ["Kadıköy", "Beşiktaş", "Şişli", "Üsküdar", "Fatih", "Sarıyer", "Beyoğlu", "Maltepe", "Ataşehir", "Bakırköy", "Pendik", "Ümraniye", "Kartal", "Tuzla", "Büyükçekmece", "Bahçelievler", "Zeytinburnu"],
  "Ankara": ["Çankaya", "Keçiören", "Yenimahalle", "Mamak", "Etimesgut", "Sincan", "Altındağ", "Gölbaşı"],
  "İzmir": ["Konak", "Karşıyaka", "Bornova", "Buca", "Çeşme", "Bayraklı", "Balçova", "Gaziemir", "Urla", "Aliağa"],
  "Bursa": ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik", "İnegöl"],
  "Antalya": ["Muratpaşa", "Kepez", "Konyaaltı", "Alanya", "Manavgat", "Kemer", "Kaş"],
  "Adana": ["Seyhan", "Çukurova", "Yüreğir", "Sarıçam", "Kozan"],
  "Muğla": ["Bodrum", "Marmaris", "Fethiye", "Menteşe", "Milas", "Ortaca", "Datça"]
};

const industries = [
  "Restoran",
  "Kafe",
  "Emlak Ofisi",
  "Güzellik Merkezi",
  "Kuaför",
  "Diş Hekimi",
  "Klinik",
  "Spor Salonu",
  "Oto Servis",
  "Oto Galeri",
  "Eczane",
  "Otel",
  "Pansiyon",
  "Avukat",
  "Kreş",
  "Çiçekçi",
  "Market",
  "Kasap"
];

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
  const [customIndustry, setCustomIndustry] = useState(false);
  const [customLocation, setCustomLocation] = useState(false);

  const [selectedIndustry, setSelectedIndustry] = useState(industries[0]);
  const [customIndustryText, setCustomIndustryText] = useState('');

  const [selectedCity, setSelectedCity] = useState("İstanbul");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [customCityText, setCustomCityText] = useState('');
  const [customDistrictText, setCustomDistrictText] = useState('');

  const [maxResults, setMaxResults] = useState(10);

  // Set default district when city changes
  useEffect(() => {
    setSelectedDistrict(""); // Default: Tümü / İl Genelinde
  }, [selectedCity]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const queryVal = customIndustry ? customIndustryText.trim() : selectedIndustry;
    
    let locationVal = '';
    if (customLocation) {
      locationVal = `${customCityText.trim()} ${customDistrictText.trim()}`.trim();
    } else {
      locationVal = selectedDistrict && selectedDistrict !== "" 
        ? `${selectedCity} ${selectedDistrict}` 
        : selectedCity;
    }

    if (!queryVal || !locationVal) return;

    onSearch(queryVal, locationVal, maxResults);
  };

  const currentDistricts = popularDistricts[selectedCity] || [];

  return (
    <form onSubmit={handleSubmit} className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', padding: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        
        {/* Industry */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label htmlFor="industry" style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
              Sektör / İşletme Türü
            </label>
            <button
              type="button"
              onClick={() => setCustomIndustry(!customIndustry)}
              style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
              className="text-link"
            >
              {customIndustry ? 'Listeden Seç' : 'Kendin Yaz'}
            </button>
          </div>

          {customIndustry ? (
            <input
              type="text"
              placeholder="Örn: Veteriner, Butik"
              value={customIndustryText}
              onChange={(e) => setCustomIndustryText(e.target.value)}
              required
              disabled={isLoading}
            />
          ) : (
            <select
              id="industry"
              value={selectedIndustry}
              onChange={(e) => setSelectedIndustry(e.target.value)}
              disabled={isLoading}
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
          )}
        </div>

        {/* Location Selector */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <label htmlFor="city" style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600 }}>
              Konum / Şehir
            </label>
            <button
              type="button"
              onClick={() => setCustomLocation(!customLocation)}
              style={{ border: 'none', background: 'transparent', color: 'var(--primary)', fontFamily: 'var(--font-sans)', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}
              className="text-link"
            >
              {customLocation ? 'Listeden Seç' : 'Kendin Yaz'}
            </button>
          </div>

          {customLocation ? (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="İl (Örn: Eskişehir)"
                value={customCityText}
                onChange={(e) => setCustomCityText(e.target.value)}
                required
                disabled={isLoading}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                placeholder="İlçe (İsteğe bağlı)"
                value={customDistrictText}
                onChange={(e) => setCustomDistrictText(e.target.value)}
                disabled={isLoading}
                style={{ flex: 1 }}
              />
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                disabled={isLoading}
                style={{ flex: 1 }}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <select
                id="district"
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={isLoading}
                style={{ flex: 1 }}
              >
                <option value="">İl Geneli (Tümü)</option>
                {currentDistricts.map((dist) => (
                  <option key={dist} value={dist}>{dist}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Max Results */}
        <div>
          <label htmlFor="maxResults" style={{ marginBottom: '0.4rem', fontSize: '0.85rem', fontWeight: 600 }}>
            Sonuç Limiti
          </label>
          <select
            id="maxResults"
            value={maxResults}
            onChange={(e) => setMaxResults(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={5}>5 Sonuç</option>
            <option value={10}>10 Sonuç</option>
            <option value={20}>20 Sonuç</option>
            <option value={50}>50 Sonuç</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={isLoading}
        style={{ alignSelf: 'flex-end', minWidth: '150px', height: '42px', fontSize: '0.9rem' }}
      >
        {isLoading ? (
          <>
            <Loader2 size={16} className="animate-spin" style={{ animation: 'spin 1s linear infinite', marginRight: '4px' }} />
            Taranıyor...
          </>
        ) : (
          'Taramayı Başlat'
        )}
      </button>

      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
