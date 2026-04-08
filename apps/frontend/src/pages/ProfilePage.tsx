import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { usersApi } from '../api/users';
import { listingsApi } from '../api/listings';
import { CATEGORIES, KERNEN } from '@hve/shared';

const AVAILABILITY_OPTIONS = [
  'weekday_morning', 'weekday_afternoon', 'weekday_evening',
  'weekend_morning', 'weekend_afternoon', 'weekend_evening',
];

export default function ProfilePage() {
  const { t } = useTranslation();
  const { user, setUser, logout } = useAuthStore();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    postcode: user?.postcode || '',
    neighbourhood: user?.neighbourhood || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    availability: user?.availability || [] as string[],
    interests: user?.interests || [] as string[],
  });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });

  const { data: myListings } = useQuery({
    queryKey: ['my-listings'],
    queryFn: listingsApi.getMyListings,
    enabled: !!user,
  });

  const updateMutation = useMutation({
    mutationFn: () => usersApi.updateMe(form),
    onSuccess: (updated) => {
      setUser(updated);
      setEditing(false);
      toast.success(t('profile.save'));
    },
    onError: () => toast.error(t('common.error')),
  });

  const photoMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadPhoto(file),
    onSuccess: (data) => {
      setUser({ ...user!, profilePhoto: data.profilePhoto });
      toast.success(t('profile.photo_upload'));
    },
  });

  const changePwMutation = useMutation({
    mutationFn: () => usersApi.changePassword(pwForm.currentPassword, pwForm.newPassword),
    onSuccess: () => {
      setChangingPw(false);
      setPwForm({ currentPassword: '', newPassword: '' });
      toast.success(t('profile.change_password') + '!');
    },
    onError: () => toast.error(t('common.error')),
  });

  const deleteMutation = useMutation({
    mutationFn: usersApi.deleteAccount,
    onSuccess: () => { logout(); },
  });

  const toggleArr = (arr: string[], key: 'availability' | 'interests', val: string) => {
    setForm({ ...form, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val] });
  };

  const API_URL = import.meta.env.VITE_API_URL || '';

  if (!user) return null;

  return (
    <div style={{ padding: '24px 16px 60px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, color: 'var(--navy)' }}>{t('profile.title')}</h1>

        {/* Profile header */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body" style={{ display: 'flex', gap: 16, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              {user.profilePhoto ? (
                <img src={`${API_URL}${user.profilePhoto}`} className="avatar avatar-xl" alt="" />
              ) : (
                <div className="avatar-placeholder avatar-xl" style={{ fontSize: '1.6rem' }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute', bottom: 0, right: 0,
                  background: 'var(--primary)', color: '#fff',
                  border: 'none', borderRadius: '50%',
                  width: 28, height: 28, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem',
                }}
                title={t('profile.photo_upload')}
              >
                📷
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
                onChange={(e) => { if (e.target.files?.[0]) photoMutation.mutate(e.target.files[0]); }} />
            </div>

            <div style={{ flex: 1 }}>
              <h2 style={{ marginBottom: 4 }}>{user.firstName} {user.lastName}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 4 }}>
                📍 {user.neighbourhood} · {user.postcode}
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 8 }}>
                {t('profile.member_since')} {format(new Date(user.createdAt), 'MMMM yyyy')}
              </p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {user.roles.map((r) => (
                  <span key={r} className="badge badge-navy">{t(`auth.role_${r}`)}</span>
                ))}
              </div>
            </div>

            <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? t('profile.cancel') : t('profile.edit')}
            </button>
          </div>
        </div>

        {/* Edit form */}
        {editing && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-body">
              <h3 style={{ marginBottom: 16 }}>{t('profile.edit')}</h3>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.first_name')}</label>
                  <input className="form-input" value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.last_name')}</label>
                  <input className="form-input" value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">{t('auth.postcode')}</label>
                  <input className="form-input" value={form.postcode}
                    onChange={(e) => setForm({ ...form, postcode: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('auth.neighbourhood')}</label>
                  <select className="form-select" value={form.neighbourhood}
                    onChange={(e) => setForm({ ...form, neighbourhood: e.target.value })}>
                    <option value="">{t('kernen.select')}</option>
                    {KERNEN.map((k) => <option key={k} value={k}>{k}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.phone')}</label>
                <input type="tel" className="form-input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">{t('auth.bio')}</label>
                <textarea className="form-textarea" rows={3} value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">{t('auth.availability')}</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AVAILABILITY_OPTIONS.map((a) => (
                    <label key={a} style={{
                      background: form.availability.includes(a) ? '#f0fce7' : '#f7f7f7',
                      border: `1px solid ${form.availability.includes(a) ? 'var(--primary)' : 'var(--border)'}`,
                      borderRadius: 20, padding: '5px 12px', cursor: 'pointer', fontSize: '0.8rem',
                      fontWeight: form.availability.includes(a) ? 600 : 400,
                    }}>
                      <input type="checkbox" style={{ display: 'none' }}
                        checked={form.availability.includes(a)}
                        onChange={() => toggleArr(form.availability, 'availability', a)} />
                      {t(`availability.${a}`)}
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-primary" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  {t('profile.save')}
                </button>
                <button className="btn btn-ghost" onClick={() => setEditing(false)}>{t('profile.cancel')}</button>
              </div>
            </div>
          </div>
        )}

        {/* My listings */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3>{t('profile.my_listings')}</h3>
              <Link to="/post" className="btn btn-primary btn-sm">+ {t('nav.post')}</Link>
            </div>
            {!myListings?.length ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{t('profile.no_listings')}</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {myListings.map((l) => (
                  <div key={l.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', background: 'var(--bg)', borderRadius: 8,
                    gap: 10, flexWrap: 'wrap',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {l.title}
                      </p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        <span className={`badge badge-sm ${l.status === 'active' ? 'badge-green' : l.status === 'draft' ? 'badge-gray' : 'badge-orange'}`}>
                          {l.status}
                        </span>
                        {' · '}{l.neighbourhood}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link to={`/listings/${l.id}`} className="btn btn-ghost btn-sm">👁</Link>
                      <Link to={`/listings/${l.id}/edit`} className="btn btn-outline btn-sm">✏️</Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Change password */}
        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-body">
            <button
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}
              onClick={() => setChangingPw(!changingPw)}
            >
              <h3>{t('profile.change_password')}</h3>
              <span style={{ color: 'var(--text-muted)' }}>{changingPw ? '▲' : '▼'}</span>
            </button>
            {changingPw && (
              <div style={{ marginTop: 16 }}>
                <div className="form-group">
                  <label className="form-label">{t('profile.current_password')}</label>
                  <input type="password" className="form-input" value={pwForm.currentPassword}
                    onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">{t('profile.new_password')}</label>
                  <input type="password" className="form-input" value={pwForm.newPassword}
                    onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} />
                </div>
                <button className="btn btn-primary" onClick={() => changePwMutation.mutate()}>
                  {t('profile.save')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ border: '2px solid #fed7d7' }}>
          <div className="card-body">
            <h3 style={{ color: '#e53e3e', marginBottom: 12 }}>{t('profile.delete_account')}</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: 14 }}>
              {t('profile.delete_confirm')}
            </p>
            <button
              className="btn btn-danger"
              onClick={() => {
                if (window.confirm(t('profile.delete_confirm'))) deleteMutation.mutate();
              }}
            >
              {t('profile.delete_account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
