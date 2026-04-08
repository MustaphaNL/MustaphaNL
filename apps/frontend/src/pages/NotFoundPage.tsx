import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <div style={{ minHeight: '70dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <div style={{ fontSize: '5rem', marginBottom: 16 }}>404</div>
        <h2 style={{ color: 'var(--navy)', marginBottom: 16 }}>{t('errors.not_found')}</h2>
        <Link to="/" className="btn btn-primary">{t('nav.home')}</Link>
      </div>
    </div>
  );
}
