import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const NAV_ITEMS = [
  { path: '/admin', label: 'admin.stats', icon: '📊', exact: true },
  { path: '/admin/users', label: 'admin.users', icon: '👥' },
  { path: '/admin/listings', label: 'admin.listings', icon: '📋' },
  { path: '/admin/analytics', label: 'admin.analytics', icon: '📈' },
];

export default function AdminLayout() {
  const { t } = useTranslation();
  const location = useLocation();

  const isActive = (path: string, exact?: boolean) =>
    exact ? location.pathname === path : location.pathname.startsWith(path);

  return (
    <div style={{ display: 'flex', minHeight: '100dvh' }}>
      {/* Sidebar */}
      <aside style={{
        width: 220, background: 'var(--navy)', color: '#fff',
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        position: 'sticky', top: 0, height: '100dvh', overflow: 'auto',
      }}>
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <h2 style={{ fontSize: '1rem', color: '#fff' }}>⚙️ {t('admin.title')}</h2>
        </div>
        <nav style={{ padding: '12px 8px', flex: 1 }}>
          {NAV_ITEMS.map((item) => (
            <Link key={item.path} to={item.path} style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 12px', borderRadius: 8, marginBottom: 2,
              color: '#fff', textDecoration: 'none', fontSize: '0.9rem',
              background: isActive(item.path, item.exact) ? 'rgba(255,255,255,0.15)' : 'transparent',
              fontWeight: isActive(item.path, item.exact) ? 700 : 400,
            }}>
              <span>{item.icon}</span> {t(item.label)}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', padding: '8px 12px' }}>
            ← Terug naar site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', padding: '24px', background: 'var(--bg)' }}>
        <Outlet />
      </main>

      <style>{`
        @media (max-width: 640px) {
          aside { width: 60px; }
          aside h2, aside nav span:last-child { display: none; }
          aside nav a { justify-content: center; padding: 12px 6px; }
        }
      `}</style>
    </div>
  );
}
