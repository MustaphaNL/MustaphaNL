import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CookieBanner() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('hve-cookies-accepted');
    if (!accepted) setVisible(true);
  }, []);

  if (!visible) return null;

  const accept = () => {
    localStorage.setItem('hve-cookies-accepted', '1');
    setVisible(false);
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 'max(80px, env(safe-area-inset-bottom, 80px))',
      left: 16, right: 16,
      background: 'var(--navy)',
      color: '#fff',
      borderRadius: 'var(--radius)',
      padding: '14px 18px',
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      zIndex: 200,
      boxShadow: 'var(--shadow-md)',
      flexWrap: 'wrap',
      maxWidth: 600,
      margin: '0 auto',
    }}>
      <p style={{ flex: 1, fontSize: '0.875rem', minWidth: 200 }}>{t('cookie.message')}</p>
      <button
        onClick={accept}
        className="btn btn-primary btn-sm"
        style={{ whiteSpace: 'nowrap' }}
      >
        {t('cookie.accept')}
      </button>
    </div>
  );
}
