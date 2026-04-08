import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authApi } from '../api/auth';
import { KERNEN } from '@hve/shared';
import { CATEGORIES } from '@hve/shared';

const GENDER_OPTIONS = ['man', 'vrouw', 'anders', 'prefer_not_to_say'] as const;
const ROLE_OPTIONS = ['volunteer', 'help_seeker', 'organisation'] as const;
const AVAILABILITY_OPTIONS = [
  'weekday_morning', 'weekday_afternoon', 'weekday_evening',
  'weekend_morning', 'weekend_afternoon', 'weekend_evening',
] as const;

interface FormData {
  email: string;
  password: string;
  passwordConfirm: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  postcode: string;
  neighbourhood: string;
  phone: string;
  bio: string;
}

export default function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [roles, setRoles] = useState<string[]>(['volunteer']);
  const [availability, setAvailability] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>();
  const password = watch('password');

  const toggleArr = (arr: string[], setArr: (a: string[]) => void, val: string) => {
    setArr(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);
  };

  const onSubmit = async (data: FormData) => {
    if (roles.length === 0) { toast.error('Kies minstens één rol'); return; }
    setLoading(true);
    try {
      await authApi.register({ ...data, roles, availability, interests });
      setSuccess(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      if (msg === 'Email already registered') {
        toast.error('Dit e-mailadres is al geregistreerd');
      } else {
        toast.error(t('common.error'));
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ maxWidth: 440, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>✉️</div>
          <h2 style={{ color: 'var(--navy)', marginBottom: 12 }}>Bijna klaar!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>{t('auth.verify_email_sent')}</p>
          <Link to="/login" className="btn btn-primary">{t('auth.login_button')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <div className="card">
          <div className="card-body" style={{ padding: '28px 24px' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: 4, color: 'var(--navy)' }}>{t('auth.register_title')}</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: '0.9rem' }}>{t('app.name')}</p>

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.first_name')} *</label>
                  <input className={`form-input ${errors.firstName ? 'error' : ''}`}
                    {...register('firstName', { required: true })} />
                  {errors.firstName && <p className="form-error">{t('auth.required')}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.last_name')} *</label>
                  <input className={`form-input ${errors.lastName ? 'error' : ''}`}
                    {...register('lastName', { required: true })} />
                  {errors.lastName && <p className="form-error">{t('auth.required')}</p>}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.email')} *</label>
                <input type="email" className={`form-input ${errors.email ? 'error' : ''}`}
                  autoComplete="email"
                  {...register('email', { required: true, pattern: /^\S+@\S+\.\S+$/ })} />
                {errors.email && <p className="form-error">{t('auth.email_invalid')}</p>}
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.password')} *</label>
                  <input type="password" className={`form-input ${errors.password ? 'error' : ''}`}
                    autoComplete="new-password"
                    {...register('password', { required: true, minLength: 8 })} />
                  {errors.password && <p className="form-error">{t('auth.password_min')}</p>}
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.password_confirm')} *</label>
                  <input type="password" className={`form-input ${errors.passwordConfirm ? 'error' : ''}`}
                    autoComplete="new-password"
                    {...register('passwordConfirm', { required: true, validate: (v) => v === password })} />
                  {errors.passwordConfirm && <p className="form-error">{t('auth.passwords_no_match')}</p>}
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.date_of_birth')} *</label>
                  <input type="date" className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
                    {...register('dateOfBirth', { required: true })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.gender')} *</label>
                  <select className={`form-select ${errors.gender ? 'error' : ''}`}
                    {...register('gender', { required: true })}>
                    <option value="">—</option>
                    {GENDER_OPTIONS.map((g) => (
                      <option key={g} value={g}>{t(`auth.gender_${g === 'prefer_not_to_say' ? 'prefer_not' : g}`)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.postcode')} *</label>
                  <input className={`form-input ${errors.postcode ? 'error' : ''}`}
                    placeholder="1234 AB"
                    {...register('postcode', { required: true })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.neighbourhood')} *</label>
                  <select className={`form-select ${errors.neighbourhood ? 'error' : ''}`}
                    {...register('neighbourhood', { required: true })}>
                    <option value="">{t('kernen.select')}</option>
                    {KERNEN.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.phone')}</label>
                <input type="tel" className="form-input" {...register('phone')} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.bio')}</label>
                <textarea className="form-textarea" rows={3} {...register('bio')} />
              </div>

              {/* Roles */}
              <div className="form-group">
                <label className="form-label">{t('auth.roles')} *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {ROLE_OPTIONS.map((role) => (
                    <label key={role} className="check-group" style={{
                      background: roles.includes(role) ? '#eaeaf8' : '#f7f7f7',
                      border: `2px solid ${roles.includes(role) ? 'var(--navy)' : 'var(--border)'}`,
                      borderRadius: 8, padding: '8px 14px', cursor: 'pointer',
                    }}>
                      <input type="checkbox" style={{ display: 'none' }}
                        checked={roles.includes(role)}
                        onChange={() => toggleArr(roles, setRoles, role)} />
                      <span>{t(`auth.role_${role}`)}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div className="form-group">
                <label className="form-label">{t('auth.availability')}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <label key={a} style={{
                      background: availability.includes(a) ? '#f0fce7' : '#f7f7f7',
                      border: `1px solid ${availability.includes(a) ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 20, padding: '5px 12px', cursor: 'pointer',
                      fontSize: '0.8rem', fontWeight: availability.includes(a) ? 600 : 400,
                    }}>
                      <input type="checkbox" style={{ display: 'none' }}
                        checked={availability.includes(a)}
                        onChange={() => toggleArr(availability, setAvailability, a)} />
                      {t(`availability.${a}`)}
                    </label>
                  ))}
                </div>
              </div>

              {/* Interests */}
              <div className="form-group">
                <label className="form-label">{t('auth.interests')}</label>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {CATEGORIES.map((cat) => (
                    <label key={cat.id} style={{
                      background: interests.includes(cat.id) ? cat.color + '22' : '#f7f7f7',
                      border: `1px solid ${interests.includes(cat.id) ? cat.color : 'var(--border)'}`,
                      borderRadius: 20, padding: '4px 10px', cursor: 'pointer',
                      fontSize: '0.78rem', fontWeight: interests.includes(cat.id) ? 600 : 400,
                      color: interests.includes(cat.id) ? cat.color : 'var(--text-muted)',
                    }}>
                      <input type="checkbox" style={{ display: 'none' }}
                        checked={interests.includes(cat.id)}
                        onChange={() => toggleArr(interests, setInterests, cat.id)} />
                      {t(`categories.${cat.id}`)}
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                {loading ? t('common.loading') : t('auth.register_button')}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              {t('auth.have_account')}{' '}
              <Link to="/login" style={{ color: 'var(--navy)', fontWeight: 600 }}>{t('nav.login')}</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
