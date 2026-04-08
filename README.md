# Haarlemmermeer Voor Elkaar

A full-stack volunteer matching web application for the municipality of Haarlemmermeer, the Netherlands.

Connect volunteers (vrijwilligers), help-seekers (hulpvragers), and organisations — independently of any external platform.

---

## Quick Start (Docker)

```bash
# 1. Copy and configure environment
cp .env.example .env
# Edit .env and change passwords/secrets!

# 2. Start everything
docker compose up --build

# App:        http://localhost:5173
# API:        http://localhost:3001
# MailHog:    http://localhost:8025  (dev email viewer)

# 3. Run the seed script (optional, for test data)
docker compose exec backend npm run db:seed
```

**Default test accounts (after seeding):**
| Email | Password | Role |
|---|---|---|
| admin@hve.nl | Admin1234! | Admin |
| jan@example.nl | Test1234! | Volunteer |
| maria@example.nl | Test1234! | Help seeker |
| welzijn@example.nl | Test1234! | Organisation |

---

## Project Structure

```
/
├── apps/
│   ├── backend/          # Node.js + Express API
│   │   ├── src/
│   │   │   ├── routes/   # auth, listings, messages, users, admin
│   │   │   ├── middleware/ # auth, analytics, upload, rateLimit
│   │   │   └── utils/    # prisma, jwt, email
│   │   └── prisma/       # Schema + migrations
│   └── frontend/         # React + Vite PWA
│       ├── src/
│       │   ├── pages/    # All page components
│       │   ├── components/  # Shared UI + admin
│       │   ├── api/      # API client functions
│       │   ├── stores/   # Zustand state (auth)
│       │   ├── i18n/     # nl / en / ar translations
│       │   └── styles/   # Global CSS
│       └── public/       # Icons, manifest
└── packages/
    └── shared/           # Shared types, categories, kernen
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite |
| Styling | Plain CSS (no framework) |
| State | Zustand + React Query |
| PWA | vite-plugin-pwa + Workbox |
| i18n | react-i18next (NL, EN, AR + RTL) |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL 16 + Prisma ORM |
| Auth | JWT (access + refresh tokens) + bcrypt |
| Email | Nodemailer (MailHog for dev) |
| File storage | Local filesystem (Docker volume) |
| Containers | Docker Compose |

---

## Features

### Public (no login required)
- Browse all listings with filters (type, category, neighbourhood, keyword)
- Location-aware: detects user position, shows nearby listings with distance
- Full listing detail view

### Registered users
- Post help requests and volunteer offers
- Upload up to 3 images per listing
- Manage own listings (edit, close, delete)
- In-app messaging with inbox + thread view
- Email notifications for new messages (email addresses never revealed)
- Direct call button (tel: link) if phone number shared
- Edit profile, upload photo, change password
- GDPR account deletion (30-day grace period)

### Admin dashboard (`/admin`)
- KPI overview: users, listings, page views
- User management: suspend, make admin, delete
- Listing management: close, delete, search
- Analytics: daily page views chart (own DB, no external trackers)
- CSV export: users and listings

---

## Development (without Docker)

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- pnpm or npm

### Backend
```bash
cd apps/backend
npm install
cp ../../.env.example .env
# Set DATABASE_URL in .env

npx prisma migrate dev
npm run dev
```

### Frontend
```bash
cd apps/frontend
npm install
npm run dev
```

### Seed database
```bash
cd apps/backend
npm run db:seed
```

---

## Environment Variables

See `.env.example` for all available variables.

**Critical for production:**
```env
JWT_SECRET=<random 32+ char string>
JWT_REFRESH_SECRET=<different random 32+ char string>
POSTGRES_PASSWORD=<strong password>
SMTP_HOST=<your SMTP host>
SMTP_FROM=noreply@yourdomein.nl
FRONTEND_URL=https://yourdomein.nl
```

---

## Production Deployment

### VPS (recommended)
```bash
# On your server:
git clone <repo>
cd MustaphaNL
cp .env.example .env
# Edit .env with production values

docker compose up -d --build

# Optional: add reverse proxy (nginx/caddy) for HTTPS
```

### HTTPS with Caddy (example)
```caddyfile
yourdomein.nl {
    reverse_proxy localhost:5173
}
api.yourdomein.nl {
    reverse_proxy localhost:3001
}
```

### HTTPS with Nginx + Let's Encrypt
```bash
apt install certbot python3-certbot-nginx
certbot --nginx -d yourdomein.nl
```

---

## Multilingual Support

- **Dutch (nl)** — default, fully translated
- **English (en)** — fully translated
- **Arabic (ar)** — translated + full RTL layout

Language is detected from browser settings. Users can switch via the language switcher in the header. The layout automatically flips to right-to-left when Arabic is selected.

---

## PWA Installation

The app can be installed as a home screen app:
- **Android**: Chrome → "Add to Home Screen"
- **iOS**: Safari → Share → "Add to Home Screen"

Offline support: cached listings are shown when there's no internet connection (via Workbox Network First strategy).

---

## Privacy & GDPR

- Phone numbers are **never shown** unless the poster explicitly enables it per listing
- Email addresses are **never shown** in the UI
- Contact via in-app messaging only (or mailto: link that opens the user's email client)
- Analytics are stored locally in PostgreSQL — no Google Analytics or third-party trackers
- Account deletion: soft delete with 30-day grace period, then hard delete
- Only functional cookies — no tracking cookies

---

## Logo

Place `HaarlemmermeerVoorElkaar_logo.jpg` in `apps/frontend/public/logo.jpg` to show the official logo in the header and hero section. The placeholder icon (green "H" on navy background) is used when the logo file is absent.

---

## Support & Issues

This app is maintained independently of NLvoorelkaar / Social Care Network.
For issues or questions, contact your system administrator.
