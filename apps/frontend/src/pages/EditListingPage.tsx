import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { listingsApi } from '../api/listings';
import { useAuthStore } from '../stores/authStore';
import { CATEGORIES, KERNEN } from '@hve/shared';

export default function EditListingPage() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [images, setImages] = useState<File[]>([]);

  const { data: listing, isLoading } = useQuery({
    queryKey: ['listing', id],
    queryFn: () => listingsApi.getById(id!),
  });

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm();

  useEffect(() => {
    if (listing) {
      reset({
        title: listing.title,
        type: listing.type,
        categoryId: listing.categoryId,
        description: listing.description,
        neighbourhood: listing.neighbourhood,
        frequency: listing.frequency,
        contactPreference: listing.contactPreference,
        showPhone: listing.showPhone,
        showEmail: listing.showEmail,
        status: listing.status,
      });
    }
  }, [listing, reset]);

  const mutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.append(k, String(v)));
      images.forEach((img) => fd.append('images', img));
      return listingsApi.update(id!, fd);
    },
    onSuccess: () => {
      toast.success(t('post.success_edit'));
      navigate(`/listings/${id}`);
    },
    onError: () => toast.error(t('common.error')),
  });

  if (!listing || isLoading) {
    return <div className="container" style={{ padding: 40 }}><p>{t('common.loading')}</p></div>;
  }

  if (listing.author.id !== user?.id && !user?.isAdmin) {
    navigate('/');
    return null;
  }

  const charCount = watch('description')?.length || 0;

  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('post.title_edit')}</h1>
        <div className="card">
          <div className="card-body" style={{ padding: 24 }}>
            <form onSubmit={handleSubmit((d) => mutation.mutate(d as Record<string, unknown>))} noValidate>
              <div className="form-group">
                <label className="form-label">{t('post.title_label')} *</label>
                <input className={`form-input ${errors.title ? 'error' : ''}`}
                  {...register('title', { required: true })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('post.category_label')} *</label>
                <select className="form-select" {...register('categoryId', { required: true })}>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{t(`categories.${c.id}`)}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('post.description_label')} *</label>
                <textarea className="form-textarea" rows={5} maxLength={1000}
                  {...register('description', { required: true, maxLength: 1000 })} />
                <p className="form-hint">{charCount}/1000</p>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('post.neighbourhood_label')}</label>
                  <select className="form-select" {...register('neighbourhood')}>
                    {KERNEN.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">{t('post.frequency_label')}</label>
                  <select className="form-select" {...register('frequency')}>
                    <option value="once">{t('listings.frequency_once')}</option>
                    <option value="recurring">{t('listings.frequency_recurring')}</option>
                    <option value="flexible">{t('listings.frequency_flexible')}</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" {...register('status')}>
                  <option value="active">{t('post.status_active')}</option>
                  <option value="draft">{t('post.status_draft')}</option>
                  <option value="closed">Gesloten</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">{t('post.images_label')}</label>
                <input type="file" accept="image/*" multiple className="form-input" style={{ padding: 10 }}
                  onChange={(e) => setImages(Array.from(e.target.files || []).slice(0, 3))} />
                {listing.images.length > 0 && images.length === 0 && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    {listing.images.map((img, i) => (
                      <img key={i} src={`${import.meta.env.VITE_API_URL || ''}${img}`} alt=""
                        style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: 6 }} />
                    ))}
                  </div>
                )}
              </div>
              <button type="submit" className="btn btn-primary btn-full" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.loading') : t('post.submit_edit')}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
