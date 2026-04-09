import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { nl, enUS, arSA } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import { messagesApi } from '../api/messages';
import { useAuthStore } from '../stores/authStore';

const LOCALE_MAP: Record<string, Locale> = { nl, en: enUS, ar: arSA };

export default function InboxPage() {
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || nl;
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ['inbox'],
    queryFn: messagesApi.getInbox,
    refetchInterval: 30000,
  });

  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h1 style={{ color: 'var(--navy)' }}>{t('inbox.title')}</h1>
          {data?.unreadCount ? (
            <span className="badge badge-pink">{data.unreadCount} {t('inbox.unread')}</span>
          ) : null}
        </div>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius)' }} />
            ))}
          </div>
        ) : !data?.threads.length ? (
          <div className="empty-state">
            <div style={{ fontSize: '3rem', marginBottom: 12 }}>💬</div>
            <h3>{t('inbox.no_messages')}</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.threads.map((msg) => {
              const isReceived = msg.receiverId === user?.id;
              const partner = isReceived ? msg.sender : msg.receiver;
              const API_URL = import.meta.env.VITE_API_URL || '';

              return (
                <Link
                  key={`${msg.listingId}-${isReceived ? msg.senderId : msg.receiverId}`}
                  to={`/inbox/${msg.listingId}/${isReceived ? msg.senderId : msg.receiverId}`}
                  style={{ textDecoration: 'none' }}
                >
                  <div style={{
                    background: '#fff',
                    borderRadius: 'var(--radius)',
                    padding: '14px 16px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    boxShadow: 'var(--shadow)',
                    borderLeft: !msg.isRead && isReceived ? '4px solid var(--primary)' : '4px solid transparent',
                    transition: 'box-shadow 0.15s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.boxShadow = 'var(--shadow-md)'}
                    onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--shadow)'}
                  >
                    {partner?.profilePhoto ? (
                      <img src={`${API_URL}${partner.profilePhoto}`} className="avatar avatar-md" alt="" />
                    ) : (
                      <div className="avatar-placeholder avatar-md" style={{ fontSize: '0.85rem', flexShrink: 0 }}>
                        {partner?.firstName?.[0]}{partner?.lastName?.[0]}
                      </div>
                    )}

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                        <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                          {partner?.firstName} {partner?.lastName}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', flexShrink: 0, marginLeft: 8 }}>
                          {format(new Date(msg.createdAt), 'd MMM', { locale })}
                        </span>
                      </div>
                      {msg.listing && (
                        <p style={{ fontSize: '0.78rem', color: 'var(--navy)', marginBottom: 3 }}>
                          {t('inbox.about')} {msg.listing.title}
                        </p>
                      )}
                      <p style={{
                        fontSize: '0.85rem', color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontWeight: !msg.isRead && isReceived ? 600 : 400,
                      }}>
                        {!isReceived && '→ '}{msg.body}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
