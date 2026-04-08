import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

interface FormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = (location.state as { from?: string })?.from || '/';

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await authApi.login(data.email, data.password);
      setAuth(res.user, res.accessToken, res.refreshToken);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg === 'Please verify your email first') {
        toast.error(t('auth.verify_email_sent'));
      } else {
        toast.error(t('auth.email_invalid'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div className="card">
          <div className="card-body" style={{ padding: 32 }}>
            <h1 style={{ fontSize: '1.6rem', marginBottom: 8, textAlign: 'center', color: 'var(--navy)' }}>
              {t('auth.login_title')}
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>
              {t('app.name')}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">{t('auth.email')}</label>
                <input
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                  {...register('email', { required: true })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.password')}</label>
                <input
                  type="password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  autoComplete="current-password"
                  {...register('password', { required: true })}
                />
              </div>

              <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--navy)', display: 'block', marginBottom: 20 }}>
                {t('auth.forgot_password')}
              </Link>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.login_button')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {t('auth.no_account')}{' '}
              <Link to="/register" style={{ color: 'var(--navy)', fontWeight: 600 }}>
                {t('nav.register')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
