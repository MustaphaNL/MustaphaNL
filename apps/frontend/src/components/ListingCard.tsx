import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { nl, enUS, arSA } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import type { Listing } from '../api/listings';
import { CATEGORIES } from '@hve/shared';

interface Props {
  listing: Listing;
  distance?: number;
}

const LOCALE_MAP: Record<string, Locale> = { nl, en: enUS, ar: arSA };

const FREQ_KEYS: Record<string, string> = {
  once: 'listings.frequency_once',
  recurring: 'listings.frequency_recurring',
  flexible: 'listings.frequency_flexible',
};

// Accent gradient per type
const TYPE_GRADIENT: Record<string, string> = {
  help_request: 'linear-gradient(90deg, #F47920, #E8197D)',
  volunteer_offer: 'linear-gradient(90deg, #6DC82A, #4DC8F0)',
};

export default function ListingCard({ listing, distance }: Props) {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || nl;

  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const API_URL = import.meta.env.VITE_API_URL || '';

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', display: 'block', height: '100%' }}>
      <article
        className="card"
        style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.boxShadow = 'var(--shadow-md)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
      >
        {/* Coloured top accent bar */}
        <div style={{
          height: 4,
          background: TYPE_GRADIENT[listing.type] || 'var(--primary)',
          flexShrink: 0,
        }} />

        {/* Image */}
        {listing.images.length > 0 && (
          <div style={{ height: 152, overflow: 'hidden', flexShrink: 0 }}>
            <img
              src={`${API_URL}${listing.images[0]}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              loading="lazy"
            />
          </div>
        )}

        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1 }}>
          {/* Badges row */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span className={listing.type === 'help_request' ? 'badge badge-orange' : 'badge badge-green'}>
              {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
            </span>
            {category && (
              <span className="badge" style={{
                background: category.color + '18',
                color: category.color,
                border: `1px solid ${category.color}40`,
              }}>
                {t(`categories.${category.id}`)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text)',
            lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.title}
          </h3>

          {/* Description preview */}
          <p style={{
            fontSize: '0.855rem',
            color: 'var(--text-muted)',
            lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            flex: 1,
          }}>
            {listing.description}
          </p>

          {/* Meta row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 4,
            marginTop: 'auto',
            paddingTop: 6,
            borderTop: '1px solid var(--border)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>📍</span>
              <span>{listing.neighbourhood}</span>
              {distance !== undefined && (
                <span style={{
                  fontWeight: 700,
                  color: 'var(--primary)',
                  background: '#f0fce7',
                  border: '1px solid #c6f2a0',
                  borderRadius: 'var(--radius-full)',
                  padding: '1px 7px',
                  fontSize: '0.75rem',
                }}>
                  {distance < 1 ? '<1' : distance.toFixed(1)} km
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {format(new Date(listing.createdAt), 'd MMM', { locale })}
            </div>
          </div>

          {/* Frequency chip */}
          <div style={{
            fontSize: '0.75rem', color: 'var(--text-muted)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <span style={{ opacity: 0.6 }}>🔄</span>
            {t(FREQ_KEYS[listing.frequency] || 'listings.frequency_flexible')}
          </div>
        </div>
      </article>
    </Link>
  );
}
