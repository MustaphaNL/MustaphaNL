import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';

export default function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) { setStatus('error'); return; }
    authApi.verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, []); // eslint-disable-line

  return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ maxWidth: 400, textAlign: 'center' }}>
        {status === 'loading' && <p>{t('common.loading')}</p>}
        {status === 'success' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>✅</div>
            <h2 style={{ color: 'var(--navy)', marginBottom: 12 }}>{t('auth.verify_email_success')}</h2>
            <Link to="/login" className="btn btn-primary">{t('auth.login_button')}</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{ fontSize: '4rem', marginBottom: 16 }}>❌</div>
            <h2 style={{ color: '#e53e3e', marginBottom: 12 }}>{t('auth.verify_email_error')}</h2>
            <Link to="/register" className="btn btn-outline">{t('nav.register')}</Link>
          </>
        )}
      </div>
    </div>
  );
}
