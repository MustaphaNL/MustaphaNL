import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../stores/authStore';
import LanguageSwitcher from './LanguageSwitcher';
import { useQuery } from '@tanstack/react-query';
import { messagesApi } from '../api/messages';

export default function Layout() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const { data: unread } = useQuery({
    queryKey: ['unread-count'],
    queryFn: messagesApi.getUnreadCount,
    enabled: !!user,
    refetchInterval: 30000,
  });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="page-wrapper">
      {/* Top header */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <img
              src="/logo.jpg"
              alt="Haarlemmermeer Voor Elkaar"
              style={{ height: 40, width: 'auto', objectFit: 'contain' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                (e.currentTarget.nextSibling as HTMLElement)?.style.setProperty('display', 'flex');
              }}
            />
            <span
              style={{
                display: 'none',
                width: 40, height: 40,
                background: 'var(--primary)',
                borderRadius: 10,
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >HvE</span>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--navy)', display: 'none' }}
              className="hide-mobile">
              Haarlemmermeer<br /><span style={{ color: 'var(--primary)' }}>Voor Elkaar</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
            <Link
              to="/listings"
              className="btn btn-ghost btn-sm"
              style={{ color: isActive('/listings') ? 'var(--navy)' : 'var(--text-muted)', fontWeight: isActive('/listings') ? 700 : 500 }}
            >
              {t('nav.browse')}
            </Link>

            {user ? (
              <>
                <Link to="/post" className="btn btn-primary btn-sm">{t('nav.post')}</Link>
                <Link
                  to="/inbox"
                  className="btn btn-ghost btn-sm"
                  style={{ position: 'relative', color: isActive('/inbox') ? 'var(--navy)' : 'var(--text-muted)' }}
                >
                  {t('nav.inbox')}
                  {(unread?.count ?? 0) > 0 && (
                    <span style={{
                      position: 'absolute', top: 4, right: 4,
                      background: 'var(--magenta)', color: '#fff',
                      borderRadius: '50%', width: 16, height: 16,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.65rem', fontWeight: 700,
                    }}>
                      {unread!.count}
                    </span>
                  )}
                </Link>
                <Link
                  to="/profile"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 44, padding: '0 8px' }}
                  title={t('nav.profile')}
                >
                  {user.profilePhoto ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL || ''}${user.profilePhoto}`}
                      className="avatar avatar-sm"
                      alt=""
                    />
                  ) : (
                    <div className="avatar-placeholder avatar-sm" style={{ fontSize: '0.75rem' }}>
                      {user.firstName[0]}{user.lastName[0]}
                    </div>
                  )}
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" className="btn btn-ghost btn-sm" style={{ color: 'var(--navy)' }}>
                    {t('nav.admin')}
                  </Link>
                )}
                <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
                  {t('nav.logout')}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost btn-sm">{t('nav.login')}</Link>
                <Link to="/register" className="btn btn-primary btn-sm">{t('nav.register')}</Link>
              </>
            )}
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      {/* Mobile bottom nav */}
      <nav style={{
        display: 'flex',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#fff',
        borderTop: '1px solid var(--border)',
        zIndex: 100,
        padding: '4px 0',
      }} className="mobile-nav safe-bottom">
        <MobileNavItem to="/" label={t('nav.home')} active={location.pathname === '/'} icon="🏠" />
        <MobileNavItem to="/listings" label={t('nav.browse')} active={isActive('/listings')} icon="🔍" />
        {user ? (
          <>
            <MobileNavItem to="/post" label={t('nav.post')} active={isActive('/post')} icon="➕" primary />
            <MobileNavItem to="/inbox" label={t('nav.inbox')} active={isActive('/inbox')} icon="💬"
              badge={unread?.count} />
            <MobileNavItem to="/profile" label={t('nav.profile')} active={isActive('/profile')} icon="👤" />
          </>
        ) : (
          <>
            <MobileNavItem to="/login" label={t('nav.login')} active={isActive('/login')} icon="🔑" />
            <MobileNavItem to="/register" label={t('nav.register')} active={isActive('/register')} icon="✏️" />
          </>
        )}
      </nav>

      <style>{`
        @media (min-width: 768px) {
          .mobile-nav { display: none !important; }
          main { padding-bottom: 0 !important; }
        }
        @media (max-width: 520px) {
          .hide-mobile { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function MobileNavItem({ to, label, active, icon, primary, badge }: {
  to: string; label: string; active: boolean; icon: string; primary?: boolean; badge?: number;
}) {
  return (
    <Link to={to} style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 2,
      padding: '6px 4px',
      color: active ? (primary ? 'var(--primary)' : 'var(--navy)') : 'var(--text-muted)',
      fontSize: '0.62rem',
      fontWeight: active ? 700 : 400,
      position: 'relative',
      minHeight: 44,
      justifyContent: 'center',
      textDecoration: 'none',
    }}>
      <span style={{ fontSize: '1.1rem' }}>{icon}</span>
      {label}
      {badge ? (
        <span style={{
          position: 'absolute', top: 2, right: '25%',
          background: 'var(--magenta)', color: '#fff',
          borderRadius: '50%', width: 14, height: 14,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.6rem', fontWeight: 700,
        }}>{badge}</span>
      ) : null}
    </Link>
  );
}
