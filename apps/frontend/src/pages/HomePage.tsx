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
    colorHex: '#6DC82A',
    bg: '#f0fce7',
    borderHover: '#6DC82A',
  },
  {
    key: 'helpseeker',
    emoji: '🙏',
    filter: 'help_request',
    color: 'var(--navy)',
    colorHex: '#1A1A8C',
    bg: '#eaebf8',
    borderHover: '#1A1A8C',
  },
  {
    key: 'org',
    emoji: '🏢',
    filter: null,
    color: 'var(--orange)',
    colorHex: '#F47920',
    bg: '#fff4e8',
    borderHover: '#F47920',
  },
];

// Triangle accent component for decorating sections
function TriangleAccent({ colors }: { colors: string[] }) {
  return (
    <svg
      aria-hidden="true"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      viewBox="0 0 800 300"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Top-left mosaic cluster */}
      <polygon points="0,0 120,0 0,120" fill={colors[0]} opacity="0.15" />
      <polygon points="120,0 240,0 120,120" fill={colors[1]} opacity="0.10" />
      <polygon points="0,120 120,240 0,240" fill={colors[2]} opacity="0.10" />
      <polygon points="120,0 240,120 120,120" fill={colors[3]} opacity="0.08" />

      {/* Top-right cluster */}
      <polygon points="800,0 680,0 800,120" fill={colors[4]} opacity="0.12" />
      <polygon points="680,0 560,0 680,120" fill={colors[0]} opacity="0.08" />
      <polygon points="800,120 680,240 800,240" fill={colors[1]} opacity="0.08" />

      {/* Bottom-centre subtle */}
      <polygon points="300,300 500,300 400,160" fill={colors[3]} opacity="0.06" />
      <polygon points="200,300 300,300 250,200" fill={colors[2]} opacity="0.05" />
      <polygon points="500,300 600,300 550,200" fill={colors[4]} opacity="0.05" />
    </svg>
  );
}

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
      {/* ===== Hero ===== */}
      <section style={{
        background: 'linear-gradient(145deg, #1A1A8C 0%, #2B3BA8 60%, #1a1a6e 100%)',
        color: '#fff',
        padding: 'clamp(40px, 8vw, 72px) 16px clamp(48px, 10vw, 88px)',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Mosaic triangle background */}
        <TriangleAccent colors={['#6DC82A', '#4DC8F0', '#E8197D', '#F47920', '#7B4BA0']} />

        {/* Radial glow behind content */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '70%', height: '100%',
          background: 'radial-gradient(ellipse, rgba(109,200,42,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo */}
          <div style={{ marginBottom: 24 }}>
            <img
              src="/logo.jpg"
              alt="Haarlemmermeer Voor Elkaar"
              style={{ height: 64, width: 'auto', margin: '0 auto', objectFit: 'contain', display: 'block' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                const next = e.currentTarget.nextSibling as HTMLElement;
                if (next) next.style.display = 'flex';
              }}
            />
            {/* Fallback logo mark */}
            <div style={{
              display: 'none',
              width: 64, height: 64,
              margin: '0 auto',
              background: 'linear-gradient(135deg, #6DC82A 50%, #4DC8F0 50%)',
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 900,
              fontSize: '1.4rem',
              color: '#fff',
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            }}>
              H
            </div>
          </div>

          <h1 style={{
            marginBottom: 14,
            color: '#fff',
            fontSize: 'clamp(1.7rem, 5vw, 2.6rem)',
            fontWeight: 800,
            letterSpacing: '-0.5px',
            textShadow: '0 2px 12px rgba(0,0,0,0.25)',
          }}>
            {t('home.hero_title')}
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2.5vw, 1.15rem)',
            opacity: 0.88,
            maxWidth: 500,
            margin: '0 auto 36px',
            lineHeight: 1.55,
          }}>
            {t('home.hero_subtitle')}
          </p>

          {/* Stats bar */}
          {stats && (
            <div style={{
              display: 'inline-flex',
              gap: 0,
              background: 'rgba(255,255,255,0.1)',
              borderRadius: 'var(--radius)',
              border: '1px solid rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
              overflow: 'hidden',
            }}>
              <StatPill value={stats.total + '+'} label={t('home.stats_listings')} color="#6DC82A" />
              <StatPill value="20" label={t('home.stats_neighbourhoods')} color="#4DC8F0" border />
            </div>
          )}
        </div>
      </section>

      {/* ===== Role cards ===== */}
      <section style={{ padding: 'clamp(32px, 6vw, 56px) 16px', background: 'var(--bg)' }}>
        <div className="container">
          <h2 style={{ textAlign: 'center', marginBottom: 8, color: 'var(--navy)' }}>
            {t('home.what_to_do')}
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 32, fontSize: '0.95rem' }}>
            Kies hoe je wilt meedoen
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            maxWidth: 900,
            margin: '0 auto',
          }}>
            {ROLE_CARDS.map((card) => (
              <button
                key={card.key}
                onClick={() => navigate(card.filter ? `/listings?type=${card.filter}` : '/listings')}
                style={{
                  background: card.bg,
                  border: `2px solid transparent`,
                  borderRadius: 'var(--radius)',
                  padding: '28px 24px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = card.colorHex;
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = `0 12px 32px ${card.colorHex}28`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = '';
                }}
              >
                {/* Triangle decoration (top-right corner) */}
                <svg
                  aria-hidden="true"
                  style={{ position: 'absolute', top: 0, right: 0, width: 60, height: 60, pointerEvents: 'none' }}
                  viewBox="0 0 60 60"
                >
                  <polygon points="60,0 60,60 0,0" fill={card.colorHex} opacity="0.12" />
                </svg>

                <span style={{ fontSize: '2.4rem', lineHeight: 1 }}>{card.emoji}</span>
                <div>
                  <p style={{
                    fontWeight: 700, fontSize: '1.1rem',
                    color: card.colorHex, marginBottom: 6,
                    lineHeight: 1.25,
                  }}>
                    {t(`home.card_${card.key}_title`)}
                  </p>
                  <p style={{
                    fontSize: '0.875rem', color: 'var(--text-muted)',
                    lineHeight: 1.45,
                  }}>
                    {t(`home.card_${card.key}_desc`)}
                  </p>
                </div>
                <span style={{
                  fontSize: '0.82rem', fontWeight: 700,
                  color: card.colorHex,
                  display: 'flex', alignItems: 'center', gap: 4,
                  marginTop: 'auto',
                }}>
                  Bekijk →
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Category strip ===== */}
      <CategoryStrip />

      {/* ===== Recent listings preview ===== */}
      <RecentListings />

      {/* ===== How it works ===== */}
      <HowItWorks />
    </div>
  );
}

function StatPill({ value, label, color, border }: { value: string; label: string; color: string; border?: boolean }) {
  return (
    <div style={{
      padding: '12px 24px',
      textAlign: 'center',
      borderLeft: border ? '1px solid rgba(255,255,255,0.15)' : 'none',
    }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.72rem', opacity: 0.75, marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
    </div>
  );
}

const ACCENT_COLORS = ['#6DC82A', '#E8197D', '#F47920', '#7B4BA0', '#4DC8F0', '#2B3BA8'];
const CAT_SAMPLES = [
  { id: 'maatje_buddy', emoji: '🤝' },
  { id: 'vervoer_transport', emoji: '🚗' },
  { id: 'koken_maaltijden', emoji: '🍲' },
  { id: 'klussen_buiten_tuin', emoji: '🌿' },
  { id: 'taal_lezen', emoji: '📖' },
  { id: 'techniek_reparatie', emoji: '🔧' },
];

function CategoryStrip() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <section style={{
      background: '#fff',
      borderTop: '1px solid var(--border)',
      borderBottom: '1px solid var(--border)',
      padding: '28px 16px',
      overflow: 'hidden',
    }}>
      <div className="container">
        <p style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: 14, textAlign: 'center' }}>
          Populaire categorieën
        </p>
        <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
          {CAT_SAMPLES.map((cat, i) => (
            <button
              key={cat.id}
              onClick={() => navigate(`/listings?category=${cat.id}`)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                border: `1.5px solid ${ACCENT_COLORS[i % ACCENT_COLORS.length]}44`,
                background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}0d`,
                color: ACCENT_COLORS[i % ACCENT_COLORS.length],
                fontSize: '0.85rem', fontWeight: 600,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = `${ACCENT_COLORS[i % ACCENT_COLORS.length]}22`;
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = `${ACCENT_COLORS[i % ACCENT_COLORS.length]}0d`;
                e.currentTarget.style.transform = '';
              }}
            >
              <span>{cat.emoji}</span>
              {t(`categories.${cat.id}`)}
            </button>
          ))}
          <button
            onClick={() => navigate('/listings')}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              border: '1.5px solid var(--border)',
              background: 'transparent',
              color: 'var(--text-muted)',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Alle categorieën →
          </button>
        </div>
      </div>
    </section>
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
    <section style={{ padding: 'clamp(32px, 6vw, 56px) 16px', background: 'var(--bg)' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 }}>
          <div>
            <h2 style={{ color: 'var(--navy)', marginBottom: 4 }}>Recent geplaatst</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Bekijk de nieuwste hulpvragen en -aanbod</p>
          </div>
          <Link to="/listings" style={{
            color: 'var(--primary)', fontWeight: 700, fontSize: '0.875rem',
            display: 'flex', alignItems: 'center', gap: 4,
            textDecoration: 'none', flexShrink: 0,
          }}>
            Alles zien →
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}>
          {data.data.map((listing, i) => (
            <Link key={listing.id} to={`/listings/${listing.id}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#fff',
                borderRadius: 'var(--radius)',
                padding: 18,
                boxShadow: 'var(--shadow-card)',
                border: '1px solid rgba(0,0,0,0.04)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                position: 'relative',
                overflow: 'hidden',
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = '';
                  e.currentTarget.style.boxShadow = 'var(--shadow-card)';
                }}
              >
                {/* Colour accent bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0,
                  height: 4,
                  background: listing.type === 'help_request'
                    ? `linear-gradient(90deg, var(--orange), var(--magenta))`
                    : `linear-gradient(90deg, var(--primary), var(--light-blue))`,
                }} />

                <span className={`badge ${listing.type === 'help_request' ? 'badge-orange' : 'badge-green'}`}
                  style={{ alignSelf: 'flex-start', marginTop: 6 }}>
                  {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
                </span>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1.35 }}>
                  {listing.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', flex: 1, lineHeight: 1.4 }}>
                  {listing.description.slice(0, 90)}{listing.description.length > 90 ? '…' : ''}
                </p>
                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span>📍</span> {listing.neighbourhood}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const STEPS = [
    { icon: '👁', label: 'Bladeren', desc: 'Bekijk alle hulpvragen en -aanbod zonder in te loggen', color: '#4DC8F0' },
    { icon: '📝', label: 'Registreren', desc: 'Maak een gratis account aan in 2 minuten', color: '#6DC82A' },
    { icon: '💬', label: 'Contact', desc: 'Stuur een bericht en maak een match', color: '#E8197D' },
  ];

  return (
    <section style={{
      padding: 'clamp(32px, 6vw, 56px) 16px',
      background: '#fff',
      borderTop: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle triangle pattern */}
      <div className="geo-bg" style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
      }} />

      <div className="container" style={{ position: 'relative', zIndex: 1 }}>
        <h2 style={{ textAlign: 'center', color: 'var(--navy)', marginBottom: 8 }}>
          Zo werkt het
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36, fontSize: '0.9rem' }}>
          In drie stappen aan de slag
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 24,
          maxWidth: 700,
          margin: '0 auto',
        }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: 68, height: 68, borderRadius: '50%',
                background: step.color + '18',
                border: `2px solid ${step.color}44`,
                margin: '0 auto 14px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.8rem',
                position: 'relative',
              }}>
                {step.icon}
                <span style={{
                  position: 'absolute', top: -6, right: -6,
                  width: 22, height: 22, borderRadius: '50%',
                  background: step.color, color: '#fff',
                  fontSize: '0.7rem', fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {i + 1}
                </span>
              </div>
              <p style={{ fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>{step.label}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: '1rem', padding: '13px 32px' }}>
            Gratis meedoen →
          </Link>
          <Link to="/listings" style={{ display: 'block', marginTop: 12, color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Of bekijk eerst het aanbod
          </Link>
        </div>
      </div>
    </section>
  );
}
