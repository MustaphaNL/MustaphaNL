import { useTranslation } from 'react-i18next';

const LANGS = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'ar', label: 'عر', flag: '🇸🇦' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => i18n.changeLanguage(l.code)}
          style={{
            background: i18n.language === l.code ? 'var(--navy)' : 'transparent',
            color: i18n.language === l.code ? '#fff' : 'var(--text-muted)',
            border: 'none',
            borderRadius: 6,
            padding: '4px 7px',
            fontSize: '0.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            minHeight: 30,
            transition: 'all 0.15s',
          }}
          aria-label={`Switch to ${l.label}`}
          title={l.code === 'ar' ? 'العربية' : l.code === 'nl' ? 'Nederlands' : 'English'}
        >
          {l.code === 'ar' ? l.label : l.flag} {l.label}
        </button>
      ))}
    </div>
  );
}
