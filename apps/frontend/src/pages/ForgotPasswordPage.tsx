import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '../api/auth';

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 32 }}>
            {sent ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>📬</div>
                <p style={{ marginBottom: 20 }}>{t('auth.reset_sent')}</p>
                <Link to="/login" className="btn btn-navy">{t('auth.login_button')}</Link>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: '1.4rem', marginBottom: 20, color: 'var(--navy)' }}>
                  {t('auth.forgot_password')}
                </h1>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">{t('auth.email')}</label>
                    <input type="email" className="form-input" value={email}
                      onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? t('common.loading') : 'Verstuur reset link'}
                  </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: 16, fontSize: '0.875rem' }}>
                  <Link to="/login" style={{ color: 'var(--navy)' }}>← {t('auth.login_button')}</Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
