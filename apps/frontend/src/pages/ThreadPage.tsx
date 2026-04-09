import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { nl, enUS, arSA } from 'date-fns/locale';
import type { Locale } from 'date-fns';
import toast from 'react-hot-toast';
import { messagesApi } from '../api/messages';
import { useAuthStore } from '../stores/authStore';
import { listingsApi } from '../api/listings';

const LOCALE_MAP: Record<string, Locale> = { nl, en: enUS, ar: arSA };

export default function ThreadPage() {
  const { listingId, partnerId } = useParams<{ listingId: string; partnerId: string }>();
  const { t, i18n } = useTranslation();
  const locale = LOCALE_MAP[i18n.language] || nl;
  const user = useAuthStore((s) => s.user);
  const qc = useQueryClient();
  const [text, setText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const API_URL = import.meta.env.VITE_API_URL || '';

  const { data: messages, isLoading } = useQuery({
    queryKey: ['thread', listingId, partnerId],
    queryFn: () => messagesApi.getThread(listingId!, partnerId!),
    refetchInterval: 10000,
  });

  const { data: listing } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: () => listingsApi.getById(listingId!),
  });

  const partner = messages?.find((m) => m.sender.id !== user?.id)?.sender;

  const sendMutation = useMutation({
    mutationFn: () => messagesApi.send({
      listingId: listingId!,
      receiverId: partnerId!,
      body: text,
    }),
    onSuccess: () => {
      setText('');
      qc.invalidateQueries({ queryKey: ['thread', listingId, partnerId] });
      qc.invalidateQueries({ queryKey: ['inbox'] });
    },
    onError: () => toast.error(t('common.error')),
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100dvh - 60px)' }}>
      {/* Header */}
      <div style={{
        background: '#fff', borderBottom: '1px solid var(--border)',
        padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
      }}>
        <Link to="/inbox" style={{ color: 'var(--text-muted)', fontSize: '1.2rem', lineHeight: 1 }}>←</Link>
        {partner && (
          <>
            {partner.profilePhoto ? (
              <img src={`${API_URL}${partner.profilePhoto}`} className="avatar avatar-sm" alt="" />
            ) : (
              <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>
                {partner.firstName[0]}{partner.lastName[0]}
              </div>
            )}
            <div>
              <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{partner.firstName} {partner.lastName}</p>
              {listing && (
                <Link to={`/listings/${listingId}`} style={{ fontSize: '0.75rem', color: 'var(--navy)' }}>
                  {listing.title}
                </Link>
              )}
            </div>
          </>
        )}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflow: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('common.loading')}</p>
        ) : messages?.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{t('inbox.no_messages')}</p>
        ) : (
          messages?.map((msg) => {
            const isMine = msg.sender.id === user?.id;
            return (
              <div key={msg.id} style={{
                display: 'flex',
                justifyContent: isMine ? 'flex-end' : 'flex-start',
                gap: 8,
              }}>
                {!isMine && (
                  msg.sender.profilePhoto ? (
                    <img src={`${API_URL}${msg.sender.profilePhoto}`} className="avatar avatar-sm" alt=""
                      style={{ alignSelf: 'flex-end' }} />
                  ) : (
                    <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.7rem', alignSelf: 'flex-end' }}>
                      {msg.sender.firstName[0]}{msg.sender.lastName[0]}
                    </div>
                  )
                )}
                <div style={{
                  maxWidth: '75%',
                  background: isMine ? 'var(--navy)' : '#fff',
                  color: isMine ? '#fff' : 'var(--text)',
                  padding: '10px 14px',
                  borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  boxShadow: 'var(--shadow)',
                }}>
                  <p style={{ fontSize: '0.925rem', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.body}</p>
                  <p style={{ fontSize: '0.68rem', opacity: 0.6, marginTop: 4, textAlign: 'right' }}>
                    {format(new Date(msg.createdAt), 'd MMM HH:mm', { locale })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        background: '#fff',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: 8,
        flexShrink: 0,
      }} className="safe-bottom">
        <textarea
          className="form-textarea"
          placeholder={t('inbox.type_message')}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) sendMutation.mutate();
            }
          }}
          rows={1}
          style={{ flex: 1, resize: 'none', minHeight: 44, maxHeight: 120 }}
        />
        <button
          className="btn btn-primary"
          onClick={() => text.trim() && sendMutation.mutate()}
          disabled={!text.trim() || sendMutation.isPending}
          style={{ alignSelf: 'flex-end' }}
        >
          {t('inbox.send')}
        </button>
      </div>
    </div>
  );
}
