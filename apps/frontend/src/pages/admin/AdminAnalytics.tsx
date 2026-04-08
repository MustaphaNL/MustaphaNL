import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';

export default function AdminAnalytics() {
  const { t } = useTranslation();
  const [days, setDays] = useState(30);

  const { data: pageViews, isLoading } = useQuery({
    queryKey: ['admin-page-views', days],
    queryFn: () => adminApi.getPageViews(days),
  });

  const max = pageViews ? Math.max(...pageViews.map((d) => d.count), 1) : 1;

  return (
    <div>
      <h1 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('admin.analytics')}</h1>

      <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 24, boxShadow: 'var(--shadow)', marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ fontSize: '1.1rem' }}>Paginaweergaven per dag</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {[7, 14, 30, 90].map((d) => (
              <button key={d} className="btn btn-sm"
                onClick={() => setDays(d)}
                style={{
                  background: days === d ? 'var(--navy)' : 'var(--bg)',
                  color: days === d ? '#fff' : 'var(--text-muted)',
                  border: '1px solid var(--border)',
                }}>
                {d}d
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="skeleton" style={{ height: 200 }} />
        ) : !pageViews?.length ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>Geen data beschikbaar</p>
        ) : (
          <div style={{ position: 'relative' }}>
            {/* Simple bar chart */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: 3,
              height: 200,
              padding: '0 4px',
            }}>
              {pageViews.map((item) => (
                <div key={item.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                  <div
                    title={`${item.date}: ${item.count} views`}
                    style={{
                      width: '100%',
                      height: `${Math.max((item.count / max) * 160, 4)}px`,
                      background: 'var(--navy)',
                      borderRadius: '3px 3px 0 0',
                      transition: 'height 0.3s',
                      cursor: 'pointer',
                    }}
                  />
                  <span style={{
                    fontSize: '0.55rem', color: 'var(--text-muted)',
                    transform: 'rotate(-45deg)',
                    transformOrigin: 'top left',
                    width: 30, height: 20,
                    display: pageViews.length <= 30 ? 'block' : 'none',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}>
                    {item.date.slice(5)}
                  </span>
                </div>
              ))}
            </div>

            {/* Y-axis labels */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 8,
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
            }}>
              <span>{pageViews[0]?.date}</span>
              <span>{pageViews[Math.floor(pageViews.length / 2)]?.date}</span>
              <span>{pageViews[pageViews.length - 1]?.date}</span>
            </div>
          </div>
        )}

        {pageViews && (
          <div style={{ marginTop: 16, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Totaal</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--navy)' }}>
                {pageViews.reduce((s, d) => s + d.count, 0).toLocaleString()}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Gemiddeld/dag</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--primary)' }}>
                {pageViews.length
                  ? Math.round(pageViews.reduce((s, d) => s + d.count, 0) / pageViews.length).toLocaleString()
                  : 0}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Piekdag</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--orange)' }}>
                {Math.max(...(pageViews.map((d) => d.count) || [0])).toLocaleString()}
              </div>
            </div>
          </div>
        )}
      </div>

      <div style={{
        background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)',
        borderLeft: '4px solid var(--primary)',
      }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          ✅ Analytics worden lokaal opgeslagen in de eigen database — geen externe trackers.
          Alleen anonieme data (geen persoonsgegevens in de analytics tabel).
        </p>
      </div>
    </div>
  );
}
