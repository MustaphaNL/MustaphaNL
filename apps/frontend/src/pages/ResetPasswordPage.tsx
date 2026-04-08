import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const token = searchParams.get('token') || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { toast.error(t('auth.passwords_no_match')); return; }
    if (password.length < 8) { toast.error(t('auth.password_min')); return; }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch {
      toast.error(t('auth.verify_email_error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 32 }}>
            {done ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>✅</div>
                <p style={{ marginBottom: 20 }}>{t('auth.reset_success')}</p>
                <Link to="/login" className="btn btn-primary">{t('auth.login_button')}</Link>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: '1.4rem', marginBottom: 20, color: 'var(--navy)' }}>
                  Nieuw wachtwoord instellen
                </h1>
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">{t('auth.new_password')}</label>
                    <input type="password" className="form-input" value={password}
                      onChange={(e) => setPassword(e.target.value)} required minLength={8} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">{t('auth.password_confirm')}</label>
                    <input type="password" className="form-input" value={confirm}
                      onChange={(e) => setConfirm(e.target.value)} required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                    {loading ? t('common.loading') : 'Opslaan'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
