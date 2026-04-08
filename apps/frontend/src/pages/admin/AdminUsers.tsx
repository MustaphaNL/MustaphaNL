import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';

export default function AdminUsers() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.getUsers({ page, search }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateUser(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Opgeslagen');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Verwijderd');
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ color: 'var(--navy)' }}>{t('admin.users')}</h1>
        <button className="btn btn-outline btn-sm" onClick={adminApi.exportUsers}>
          {t('admin.export_users')}
        </button>
      </div>

      {/* Search */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <input className="form-input" placeholder={t('admin.search')}
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }} />
        <button className="btn btn-navy" onClick={() => { setSearch(searchInput); setPage(1); }}>
          {t('common.search')}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 20 }}><p>{t('common.loading')}</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Naam', 'Email', 'Rollen', 'Kern', 'Lid', 'Status', 'Acties'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data.map((user: Record<string, unknown>) => (
                <tr key={user.id as string} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '10px 14px' }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{user.firstName as string} {user.lastName as string}</p>
                    {user.isAdmin && <span className="badge badge-navy" style={{ fontSize: '0.65rem' }}>Admin</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email as string}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                    {(user.roles as string[]).map((r) => (
                      <span key={r} className="badge badge-gray" style={{ marginRight: 3, fontSize: '0.7rem' }}>{r}</span>
                    ))}
                  </td>
                  <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{user.neighbourhood as string}</td>
                  <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {format(new Date(user.createdAt as string), 'd-M-yy')}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span className={`badge ${user.isActive ? 'badge-green' : 'badge-orange'}`}>
                      {user.isActive ? 'Actief' : 'Geblokkeerd'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}
                        onClick={() => updateMutation.mutate({ id: user.id as string, data: { isActive: !user.isActive } })}>
                        {user.isActive ? t('admin.suspend') : t('admin.unsuspend')}
                      </button>
                      <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}
                        onClick={() => updateMutation.mutate({ id: user.id as string, data: { isAdmin: !user.isAdmin } })}>
                        {user.isAdmin ? t('admin.remove_admin') : t('admin.make_admin')}
                      </button>
                      <button className="btn btn-sm btn-danger" style={{ fontSize: '0.75rem' }}
                        onClick={() => {
                          if (window.confirm(t('admin.confirm_delete'))) deleteMutation.mutate(user.id as string);
                        }}>
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {page > 1 && (
            <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p - 1)}>← Vorige</button>
          )}
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            {page} / {data.totalPages}
          </span>
          {page < data.totalPages && (
            <button className="btn btn-navy btn-sm" onClick={() => setPage((p) => p + 1)}>Volgende →</button>
          )}
        </div>
      )}
    </div>
  );
}
