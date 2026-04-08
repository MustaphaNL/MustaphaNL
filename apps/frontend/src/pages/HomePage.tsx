import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { listingsApi } from '../api/listings';

const ROLE_CARDS = [
  {
    key: 'volunteer',
    emoji: '🤝',
    filter: 'volunteer_offer',
    color: 'var(--primary)',
    bg: '#f0fce7',
  },
  {
    key: 'helpseeker',
    emoji: '🙏',
    filter: 'help_request',
    color: 'var(--navy)',
    bg: '#eaeaf8',
  },
  {
    key: 'org',
    emoji: '🏢',
    filter: null,
    color: 'var(--orange)',
    bg: '#fff4e8',
  },
];

export default function HomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data: stats } = useQuery({
    queryKey: ['listings-stats'],
    queryFn: () => listingsApi.getAll({ pageSize: 1 }),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div>
      {/* Hero */}
      <section className="geo-bg" style={{
        background: 'linear-gradient(135deg, var(--navy) 0%, #2B3BA8 100%)',
        color: '#fff',
        padding: '48px 16px 56px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative triangles */}
        <svg style={{ position: 'absolute', top: 0, left: 0, opacity: 0.08, pointerEvents: 'none' }}
          width="200" height="200" viewBox="0 0 200 200" aria-hidden>
          <polygon points="0,0 200,0 0,200" fill="var(--primary)" />
          <polygon points="200,0 200,200 0,200" fill="var(--light-blue)" />
        </svg>
        <svg style={{ position: 'absolute', bottom: 0, right: 0, opacity: 0.08, pointerEvents: 'none' }}
          width="160" height="160" viewBox="0 0 160 160" aria-hidden>
          <polygon points="160,0 160,160 0,160" fill="var(--magenta)" />
        </svg>

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <img
            src="/logo.jpg"
            alt=""
            style={{ height: 60, width: 'auto', margin: '0 auto 20px', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <h1 style={{ marginBottom: 14, color: '#fff' }}>{t('home.hero_title')}</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, maxWidth: 480, margin: '0 auto 28px' }}>
            {t('home.hero_subtitle')}
          </p>

          {stats && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginTop: 8 }}>
              <Stat value={stats.total} label={t('home.stats_listings')} color="var(--primary)" />
              <Stat value={20} label={t('home.stats_neighbourhoods')} color="var(--light-blue)" />
            </div>
          )}
        </div>
      </section>

      {/* Role cards */}
      <section style={{ padding: '40px 16px' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 28 }}>{t('home.what_to_do')}</h2>
          <div className="grid-3" style={{ maxWidth: 900, margin: '0 auto' }}>
            {ROLE_CARDS.map((card) => (
              <button
                key={card.key}
                onClick={() => navigate(card.filter ? `/listings?type=${card.filter}` : '/listings')}
                style={{
                  background: card.bg,
                  border: `2px solid transparent`,
                  borderRadius: 'var(--radius)',
                  padding: 28,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  minHeight: 140,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.color;
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                <span style={{ fontSize: '2.2rem' }}>{card.emoji}</span>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1.05rem', color: card.color, marginBottom: 4 }}>
                    {t(`home.card_${card.key}_title`)}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                    {t(`home.card_${card.key}_desc`)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recent listings preview */}
      <RecentListings />
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color }}>{value}+</div>
      <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{label}</div>
    </div>
  );
}

function RecentListings() {
  const { t } = useTranslation();
  const { data } = useQuery({
    queryKey: ['listings-recent'],
    queryFn: () => listingsApi.getAll({ pageSize: 3 }),
    staleTime: 2 * 60 * 1000,
  });

  if (!data?.data.length) return null;

  return (
    <section style={{ padding: '0 16px 40px' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: '1.3rem' }}>Recent</h2>
          <Link to="/listings" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem' }}>
            {t('listings.load_more')} →
          </Link>
        </div>
        <div className="grid-3">
          {data.data.map((listing) => (
            <Link key={listing.id} to={`/listings/${listing.id}`}
              style={{ textDecoration: 'none' }}>
              <div className="card" style={{ padding: 16 }}>
                <span className={`badge ${listing.type === 'help_request' ? 'badge-orange' : 'badge-green'}`}
                  style={{ marginBottom: 8 }}>
                  {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
                </span>
                <h3 style={{ fontSize: '0.95rem', marginBottom: 4 }}>{listing.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  📍 {listing.neighbourhood}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
