import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { listingsApi } from '../api/listings';
import { CATEGORIES, KERNEN } from '@hve/shared';
import { useAuthStore } from '../stores/authStore';

interface FormData {
  title: string;
  type: string;
  categoryId: string;
  description: string;
  neighbourhood: string;
  frequency: string;
  contactPreference: string;
  showPhone: boolean;
  showEmail: boolean;
  status: string;
}

export default function PostListingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [images, setImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>({
    defaultValues: { type: 'volunteer_offer', frequency: 'flexible', contactPreference: 'in_app', status: 'active' },
  });

  const charCount = watch('description')?.length || 0;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach((img) => fd.append('images', img));
      const listing = await listingsApi.create(fd);
      toast.success(t('post.success'));
      navigate(`/listings/${listing.id}`);
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('post.title_create')}</h1>

        <div className="card">
          <div className="card-body" style={{ padding: '24px' }}>
            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              {/* Type */}
              <div className="form-group">
                <label className="form-label">{t('post.type_label')} *</label>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {[
                    { value: 'volunteer_offer', label: t('post.type_offer'), color: 'var(--primary)', bg: '#f0fce7' },
                    { value: 'help_request', label: t('post.type_help'), color: 'var(--orange)', bg: '#fff4e8' },
                  ].map((opt) => {
                    const selected = watch('type') === opt.value;
                    return (
                      <label key={opt.value} style={{
                        flex: 1, minWidth: 160,
                        background: selected ? opt.bg : '#f7f7f7',
                        border: `2px solid ${selected ? opt.color : 'var(--border)'}`,
                        borderRadius: 'var(--radius)', padding: '12px 16px',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                        fontWeight: selected ? 700 : 400,
                        color: selected ? opt.color : 'var(--text)',
                      }}>
                        <input type="radio" style={{ display: 'none' }} value={opt.value} {...register('type', { required: true })} />
                        {opt.label}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label className="form-label">{t('post.title_label')} *</label>
                <input
                  className={`form-input ${errors.title ? 'error' : ''}`}
                  placeholder={t('post.title_placeholder')}
                  {...register('title', { required: true, maxLength: 100 })}
                />
                {errors.title && <p className="form-error">{t('auth.required')}</p>}
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">{t('post.category_label')} *</label>
                <select className={`form-select ${errors.categoryId ? 'error' : ''}`}
                  {...register('categoryId', { required: true })}>
                  <option value="">—</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="form-error">{t('auth.required')}</p>}
              </div>

              {/* Description */}
              <div className="form-group">
                <label className="form-label">{t('post.description_label')} *</label>
                <textarea
                  className={`form-textarea ${errors.description ? 'error' : ''}`}
                  placeholder={t('post.description_placeholder')}
                  rows={5}
                  maxLength={1000}
                  {...register('description', { required: true, maxLength: 1000 })}
                />
                <p className="form-hint">{charCount}/1000</p>
                {errors.description && <p className="form-error">{t('auth.required')}</p>}
              </div>

              <div className="grid-2">
                {/* Neighbourhood */}
                <div className="form-group">
                  <label className="form-label">{t('post.neighbourhood_label')} *</label>
                  <select className={`form-select ${errors.neighbourhood ? 'error' : ''}`}
                    {...register('neighbourhood', { required: true })}>
                    <option value="">{t('kernen.select')}</option>
                    {KERNEN.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                  {errors.neighbourhood && <p className="form-error">{t('auth.required')}</p>}
                </div>

                {/* Frequency */}
                <div className="form-group">
                  <label className="form-label">{t('post.frequency_label')} *</label>
                  <select className="form-select" {...register('frequency', { required: true })}>
                    <option value="once">{t('listings.frequency_once')}</option>
                    <option value="recurring">{t('listings.frequency_recurring')}</option>
                    <option value="flexible">{t('listings.frequency_flexible')}</option>
                  </select>
                </div>
              </div>

              {/* Contact preference */}
              <div className="form-group">
                <label className="form-label">{t('post.contact_label')}</label>
                <select className="form-select" {...register('contactPreference')}>
                  <option value="in_app">{t('listings.contact_via_app')}</option>
                  <option value="email">{t('listings.contact_via_email')}</option>
                  <option value="both">Beide</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {user?.phone && (
                  <label className="check-group">
                    <input type="checkbox" {...register('showPhone')} />
                    {t('post.show_phone')}
                  </label>
                )}
                <label className="check-group">
                  <input type="checkbox" {...register('showEmail')} />
                  {t('post.show_email')}
                </label>
              </div>

              {/* Images */}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label className="form-label">{t('post.images_label')}</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="form-input"
                  style={{ padding: '10px' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []).slice(0, 3);
                    setImages(files);
                  }}
                />
                <p className="form-hint">{t('post.images_hint')}</p>
                {images.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                    {images.map((img, i) => (
                      <img key={i} src={URL.createObjectURL(img)} alt=""
                        style={{ height: 64, width: 64, objectFit: 'cover', borderRadius: 8, border: '2px solid var(--border)' }} />
                    ))}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" {...register('status')}>
                  <option value="active">{t('post.status_active')}</option>
                  <option value="draft">{t('post.status_draft')}</option>
                </select>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: 8 }} disabled={loading}>
                {loading ? t('common.loading') : t('post.submit_create')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
