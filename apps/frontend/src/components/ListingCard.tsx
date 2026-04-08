import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { nl, enUS, arSA } from 'date-fns/locale';
import type { Listing } from '../api/listings';
import { CATEGORIES } from '@hve/shared';
import clsx from 'clsx';

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

export default function ListingCard({ listing, distance }: Props) {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || nl;

  const category = CATEGORIES.find((c) => c.id === listing.categoryId);

  return (
    <Link to={`/listings/${listing.id}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article className="card" style={{ height: '100%', transition: 'transform 0.15s, box-shadow 0.15s' }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
      >
        {listing.images.length > 0 && (
          <div style={{ height: 160, overflow: 'hidden' }}>
            <img
              src={`${import.meta.env.VITE_API_URL || ''}${listing.images[0]}`}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              loading="lazy"
            />
          </div>
        )}

        <div className="card-body">
          {/* Type + category badges */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
            <span className={clsx('badge', listing.type === 'help_request' ? 'badge-orange' : 'badge-green')}>
              {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
            </span>
            {category && (
              <span className="badge" style={{
                background: category.color + '22',
                color: category.color,
                border: `1px solid ${category.color}44`,
              }}>
                {t(`categories.${category.id}`)}
              </span>
            )}
          </div>

          <h3 style={{
            fontSize: '1rem', fontWeight: 700, color: 'var(--text)',
            marginBottom: 6, lineHeight: 1.35,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {listing.title}
          </h3>

          <p style={{
            fontSize: '0.875rem', color: 'var(--text-muted)',
            display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 10,
          }}>
            {listing.description}
          </p>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span>📍</span>
              <span>{listing.neighbourhood}</span>
              {distance !== undefined && (
                <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                  · {distance < 1 ? '<1' : distance.toFixed(1)} km
                </span>
              )}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {format(new Date(listing.createdAt), 'd MMM', { locale })}
            </div>
          </div>

          <div style={{ marginTop: 8, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {t(FREQ_KEYS[listing.frequency] || 'listings.frequency_flexible')}
          </div>
        </div>
      </article>
    </Link>
  );
}
