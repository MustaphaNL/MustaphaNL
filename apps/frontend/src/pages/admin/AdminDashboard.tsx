import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/admin';
import { CATEGORIES } from '@hve/shared';

export default function AdminDashboard() {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: adminApi.getStats,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 100, borderRadius: 'var(--radius)' }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('admin.stats')}</h1>

      {/* KPI grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard label={t('admin.total_users')} value={stats?.totalUsers ?? 0} icon="👥" color="var(--navy)" />
        <StatCard label={t('admin.total_listings')} value={stats?.totalListings ?? 0} icon="📋" color="var(--primary)" />
        <StatCard label={t('admin.active_listings')} value={stats?.activeListings ?? 0} icon="✅" color="#38a169" />
        <StatCard label={t('admin.new_this_week')} value={stats?.newUsersThisWeek ?? 0} icon="🆕" color="var(--orange)" />
        <StatCard label={t('admin.page_views_today')} value={stats?.pageViewsToday ?? 0} icon="👁" color="var(--purple)" />
        <StatCard label="Nieuwe advertenties (week)" value={stats?.newListingsThisWeek ?? 0} icon="📌" color="var(--magenta)" />
      </div>

      {/* Listings by category */}
      {stats?.listingsByCategory?.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Advertenties per categorie</h2>
          <div style={{ background: '#fff', borderRadius: 'var(--radius)', padding: 20, boxShadow: 'var(--shadow)' }}>
            {stats.listingsByCategory.slice(0, 10).map((item: { categoryId: string; _count: { id: number } }) => {
              const cat = CATEGORIES.find((c) => c.id === item.categoryId);
              const max = stats.listingsByCategory[0]._count.id;
              const pct = Math.round((item._count.id / max) * 100);
              return (
                <div key={item.categoryId} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 3 }}>
                    <span>{cat ? t(`categories.${cat.id}`) : item.categoryId}</span>
                    <span style={{ fontWeight: 600 }}>{item._count.id}</span>
                  </div>
                  <div style={{ background: 'var(--bg)', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: cat?.color || 'var(--primary)',
                      borderRadius: 4, transition: 'width 0.6s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Type breakdown */}
      {stats?.listingsByType?.length > 0 && (
        <div>
          <h2 style={{ fontSize: '1.1rem', marginBottom: 16 }}>Advertenties per type</h2>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {stats.listingsByType.map((item: { type: string; _count: { id: number } }) => (
              <div key={item.type} style={{
                background: '#fff', borderRadius: 'var(--radius)', padding: '16px 20px',
                boxShadow: 'var(--shadow)', flex: 1, minWidth: 180, textAlign: 'center',
              }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: item.type === 'help_request' ? 'var(--orange)' : 'var(--primary)' }}>
                  {item._count.id}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  {t(item.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 'var(--radius)',
      padding: '20px', boxShadow: 'var(--shadow)',
      borderTop: `4px solid ${color}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color }}>{value.toLocaleString()}</p>
        </div>
        <span style={{ fontSize: '1.8rem' }}>{icon}</span>
      </div>
    </div>
  );
}
