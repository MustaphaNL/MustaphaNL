import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { nl, enUS, arSA } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { listingsApi } from '../api/listings';
import { messagesApi } from '../api/messages';
import { useAuthStore } from '../stores/authStore';
import { CATEGORIES } from '@hve/shared';

const LOCALE_MAP: Record<string, Locale> = { nl, en: enUS, ar: arSA };

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || nl;
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [messageText, setMessageText] = useState('');
  const [imgIdx, setImgIdx] = useState(0);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
  });

  const sendMsg = useMutation({
    mutationFn: () =>
      messagesApi.send({
        listingId: listing!.id,
        receiverId: listing!.author.id,
        body: messageText,
      }),
    onSuccess: (msg) => {
      toast.success(t('inbox.send') + '!');
      setMessageText('');
      navigate(`/inbox/${listing!.id}/${listing!.author.id}`);
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: () => listingsApi.delete(listing!.id),
    onSuccess: () => {
      toast.success('Verwijderd');
      navigate('/listings');
    },
  });

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '40px 16px' }}>
        <div className="skeleton" style={{ height: 300, borderRadius: 'var(--radius)', marginBottom: 20 }} />
        <div className="skeleton" style={{ height: 60, width: '60%', marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 120 }} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="container empty-state" style={{ padding: '80px 16px' }}>
        <h2>{t('errors.not_found')}</h2>
        <Link to="/listings" className="btn btn-navy" style={{ marginTop: 16 }}>
          {t('listings.back_to_listings')}
        </Link>
      </div>
    );
  }

  const category = CATEGORIES.find((c) => c.id === listing.categoryId);
  const isOwner = user?.id === listing.author.id;
  const API_URL = import.meta.env.VITE_API_URL || '';

  return (
    <div style={{ padding: '24px 16px 40px' }}>
      <div className="container" style={{ maxWidth: 760 }}>
        <Link to="/listings" style={{ color: 'var(--text-muted)', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 20 }}>
          ← {t('listings.back_to_listings')}
        </Link>

        {/* Images */}
        {listing.images.length > 0 && (
          <div style={{ marginBottom: 24, borderRadius: 'var(--radius)', overflow: 'hidden', background: '#000' }}>
            <img
              src={`${API_URL}${listing.images[imgIdx]}`}
              alt=""
              style={{ width: '100%', maxHeight: 420, objectFit: 'cover', display: 'block' }}
            />
            {listing.images.length > 1 && (
              <div style={{ display: 'flex', gap: 8, padding: 12, background: '#fff', justifyContent: 'center' }}>
                {listing.images.map((img, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    style={{
                      width: 52, height: 40, borderRadius: 6, overflow: 'hidden',
                      border: i === imgIdx ? '3px solid var(--primary)' : '2px solid var(--border)',
                      padding: 0, cursor: 'pointer', background: 'none',
                    }}>
                    <img src={`${API_URL}${img}`} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            <span className={`badge ${listing.type === 'help_request' ? 'badge-orange' : 'badge-green'}`}>
              {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
            </span>
            {category && (
              <span className="badge" style={{
                background: category.color + '22', color: category.color, border: `1px solid ${category.color}44`,
              }}>
                {t(`categories.${category.id}`)}
              </span>
            )}
          </div>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4vw, 1.8rem)', marginBottom: 8 }}>{listing.title}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            <span>📍 {listing.neighbourhood}</span>
            <span>🗓 {format(new Date(listing.createdAt), 'd MMMM yyyy', { locale })}</span>
            <span>👁 {t('listings.views', { count: listing.views })}</span>
          </div>
        </div>

        {/* Description */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body">
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{listing.description}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '8px 16px', marginBottom: 24, fontSize: '0.875rem' }}>
          <span style={{ fontWeight: 600 }}>{t('listings.category')}:</span>
          <span>{category ? t(`categories.${category.id}`) : listing.categoryId}</span>

          <span style={{ fontWeight: 600 }}>{t('post.frequency_label')}:</span>
          <span>{t(`listings.frequency_${listing.frequency}`)}</span>

          <span style={{ fontWeight: 600 }}>{t('listings.location')}:</span>
          <span>{listing.neighbourhood}</span>
        </div>

        {/* Author card */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-body" style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
            <Link to={`/users/${listing.author.id}`}>
              {listing.author.profilePhoto ? (
                <img src={`${API_URL}${listing.author.profilePhoto}`} className="avatar avatar-lg" alt="" />
              ) : (
                <div className="avatar-placeholder avatar-lg" style={{ fontSize: '1.1rem' }}>
                  {listing.author.firstName[0]}{listing.author.lastName[0]}
                </div>
              )}
            </Link>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700 }}>
                {listing.author.firstName} {listing.author.lastName}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>📍 {listing.author.neighbourhood}</p>
              {listing.author.bio && (
                <p style={{ fontSize: '0.85rem', marginTop: 6, color: 'var(--text)' }}>{listing.author.bio}</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        {isOwner ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link to={`/listings/${listing.id}/edit`} className="btn btn-outline">
              ✏️ {t('common.edit')}
            </Link>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(t('post.delete_confirm'))) deleteMutation.mutate();
              }}
            >
              🗑 {t('common.delete')}
            </button>
          </div>
        ) : !user ? (
          <div style={{
            background: 'var(--bg)',
            border: '2px dashed var(--border)',
            borderRadius: 'var(--radius)',
            padding: 24,
            textAlign: 'center',
          }}>
            <p style={{ marginBottom: 14, color: 'var(--text-muted)' }}>{t('listings.login_to_respond')}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <Link to="/login" className="btn btn-navy">{t('nav.login')}</Link>
              <Link to="/register" className="btn btn-outline">{t('nav.register')}</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Message form */}
            {(listing.contactPreference === 'in_app' || listing.contactPreference === 'both') && (
              <div className="card">
                <div className="card-body">
                  <h3 style={{ marginBottom: 12 }}>{t('listings.contact_via_app')}</h3>
                  <textarea
                    className="form-textarea"
                    placeholder={t('inbox.type_message')}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={4}
                  />
                  <button
                    className="btn btn-primary btn-full"
                    style={{ marginTop: 10 }}
                    onClick={() => messageText.trim() && sendMsg.mutate()}
                    disabled={!messageText.trim() || sendMsg.isPending}
                  >
                    {sendMsg.isPending ? '...' : t('inbox.send')}
                  </button>
                </div>
              </div>
            )}

            {/* Email / phone */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {(listing.contactPreference === 'email' || listing.contactPreference === 'both') && listing.showEmail && (
                <a
                  href={`mailto:?subject=Re: ${listing.title}`}
                  className="btn btn-outline"
                >
                  ✉️ {t('listings.contact_via_email')}
                </a>
              )}
              {listing.showPhone && listing.author.phone && (
                <a href={`tel:${listing.author.phone}`} className="btn btn-navy">
                  📞 {t('listings.contact_phone')}
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
