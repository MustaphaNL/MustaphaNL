import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listingsApi, ListingsParams } from '../api/listings';
import { CATEGORIES, KERNEN } from '@hve/shared';
import ListingCard from '../components/ListingCard';

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function ListingsPage() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [type, setType] = useState(searchParams.get('type') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [neighbourhood, setNeighbourhood] = useState(searchParams.get('neighbourhood') || '');
  const [page, setPage] = useState(1);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);

  const params: ListingsParams = {
    page, pageSize: 20,
    ...(type && { type }),
    ...(category && { category }),
    ...(neighbourhood && { neighbourhood }),
    ...(search && { search }),
    ...(userPos && { lat: userPos.lat, lng: userPos.lng }),
  };

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['listings', params],
    queryFn: () => listingsApi.getAll(params),
    placeholderData: (prev) => prev,
  });

  // Request location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {}
      );
    }
  }, []);

  const applyFilter = useCallback(() => {
    setPage(1);
    const sp: Record<string, string> = {};
    if (search) sp.search = search;
    if (type) sp.type = type;
    if (category) sp.category = category;
    if (neighbourhood) sp.neighbourhood = neighbourhood;
    setSearchParams(sp);
  }, [search, type, category, neighbourhood, setSearchParams]);

  useEffect(() => { applyFilter(); }, [type, category, neighbourhood]); // eslint-disable-line

  return (
    <div style={{ padding: '24px 16px' }}>
      <div className="container">
        <h1 style={{ marginBottom: 20 }}>{t('listings.title')}</h1>

        {/* Filters */}
        <div style={{
          background: '#fff',
          borderRadius: 'var(--radius)',
          padding: '16px',
          marginBottom: 24,
          boxShadow: 'var(--shadow)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          {/* Search */}
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              className="form-input"
              placeholder={t('listings.search_placeholder')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applyFilter()}
              style={{ flex: 1 }}
            />
            <button className="btn btn-navy" onClick={applyFilter} style={{ flexShrink: 0 }}>
              {t('common.search')}
            </button>
          </div>

          {/* Type toggle */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              { value: '', label: t('listings.filter_all') },
              { value: 'help_request', label: t('listings.filter_help') },
              { value: 'volunteer_offer', label: t('listings.filter_volunteer') },
            ].map((opt) => (
              <button
                key={opt.value}
                className="btn btn-sm"
                onClick={() => setType(opt.value)}
                style={{
                  background: type === opt.value ? 'var(--navy)' : 'var(--bg)',
                  color: type === opt.value ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Category + Neighbourhood */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              className="form-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ flex: 1, minWidth: 160 }}
            >
              <option value="">{t('listings.all_categories')}</option>
              {CATEGORIES.map((c) => (
                <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
              ))}
            </select>

            <select
              className="form-select"
              value={neighbourhood}
              onChange={(e) => setNeighbourhood(e.target.value)}
              style={{ flex: 1, minWidth: 140 }}
            >
              <option value="">{t('listings.all_neighbourhoods')}</option>
              {KERNEN.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
          </div>

          {userPos && (
            <p style={{ fontSize: '0.78rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              📍 {t('listings.near_you')}
            </p>
          )}
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 220, borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : data?.data.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>🔍</div>
            <h3>{t('listings.no_results')}</h3>
            <p className="text-muted">{t('listings.no_results_hint')}</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
              {data?.total} resultaten
            </p>
            <div className="grid-3">
              {data?.data.map((listing) => {
                const dist = userPos && listing.latitude && listing.longitude
                  ? haversine(userPos.lat, userPos.lng, listing.latitude, listing.longitude)
                  : undefined;
                return <ListingCard key={listing.id} listing={listing} distance={dist} />;
              })}
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32, flexWrap: 'wrap' }}>
                {page > 1 && (
                  <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p - 1)}>
                    ← Vorige
                  </button>
                )}
                <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                  {page} / {data.totalPages}
                </span>
                {page < data.totalPages && (
                  <button className="btn btn-navy btn-sm" onClick={() => setPage((p) => p + 1)} disabled={isFetching}>
                    {t('listings.load_more')} →
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
