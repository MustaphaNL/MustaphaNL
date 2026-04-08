import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { adminApi } from '../../api/admin';
import { CATEGORIES } from '@hve/shared';

export default function AdminListings() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-listings', page, search, status],
    queryFn: () => adminApi.getListings({ page, search, status: status || undefined }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      adminApi.updateListing(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('Opgeslagen');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteListing(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-listings'] });
      toast.success('Verwijderd');
    },
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <h1 style={{ color: 'var(--navy)' }}>{t('admin.listings')}</h1>
        <button className="btn btn-outline btn-sm" onClick={adminApi.exportListings}>
          {t('admin.export_listings')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder={t('admin.search')} style={{ flex: 1, minWidth: 200 }}
          value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }} />
        <select className="form-select" style={{ minWidth: 140 }} value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Alle statussen</option>
          <option value="active">Actief</option>
          <option value="draft">Concept</option>
          <option value="closed">Gesloten</option>
        </select>
        <button className="btn btn-navy" onClick={() => { setSearch(searchInput); setPage(1); }}>
          {t('common.search')}
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: 'var(--radius)', boxShadow: 'var(--shadow)', overflow: 'auto' }}>
        {isLoading ? (
          <div style={{ padding: 20 }}><p>{t('common.loading')}</p></div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 700 }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                {['Titel', 'Type', 'Categorie', 'Kern', 'Auteur', 'Status', 'Views', 'Acties'].map((h) => (
                  <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.data.map((listing: Record<string, unknown>) => {
                const cat = CATEGORIES.find((c) => c.id === (listing.categoryId as string));
                const author = listing.author as { firstName: string; lastName: string; email: string };
                return (
                  <tr key={listing.id as string} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 14px', maxWidth: 200 }}>
                      <Link to={`/listings/${listing.id}`} target="_blank" style={{ color: 'var(--navy)', fontWeight: 600, fontSize: '0.85rem' }}>
                        {(listing.title as string).slice(0, 40)}{(listing.title as string).length > 40 ? '…' : ''}
                      </Link>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${listing.type === 'help_request' ? 'badge-orange' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                        {t(listing.type === 'help_request' ? 'listings.type_help' : 'listings.type_offer')}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.8rem' }}>
                      {cat ? t(`categories.${cat.id}`) : listing.categoryId as string}
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{listing.neighbourhood as string}</td>
                    <td style={{ padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {author.firstName} {author.lastName}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span className={`badge ${listing.status === 'active' ? 'badge-green' : listing.status === 'draft' ? 'badge-gray' : 'badge-orange'}`} style={{ fontSize: '0.7rem' }}>
                        {listing.status as string}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: '0.85rem' }}>{listing.views as number}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        {listing.status !== 'closed' && (
                          <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}
                            onClick={() => updateMutation.mutate({ id: listing.id as string, data: { status: 'closed' } })}>
                            {t('admin.close_listing')}
                          </button>
                        )}
                        {listing.status === 'closed' && (
                          <button className="btn btn-sm btn-ghost" style={{ fontSize: '0.75rem' }}
                            onClick={() => updateMutation.mutate({ id: listing.id as string, data: { status: 'active' } })}>
                            Heropen
                          </button>
                        )}
                        <button className="btn btn-sm btn-danger" style={{ fontSize: '0.75rem' }}
                          onClick={() => {
                            if (window.confirm(t('admin.confirm_delete'))) deleteMutation.mutate(listing.id as string);
                          }}>
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {data && data.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {page > 1 && <button className="btn btn-outline btn-sm" onClick={() => setPage((p) => p - 1)}>← Vorige</button>}
          <span style={{ alignSelf: 'center', fontSize: '0.875rem', color: 'var(--text-muted)' }}>{page} / {data.totalPages}</span>
          {page < data.totalPages && <button className="btn btn-navy btn-sm" onClick={() => setPage((p) => p + 1)}>Volgende →</button>}
        </div>
      )}
    </div>
  );
}
