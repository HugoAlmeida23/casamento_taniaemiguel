# casamento_taniaemiguel — Astro + Supabase + GitHub Pages

Wedding website for Tânia & Miguel. Fully static frontend deployed to GitHub Pages, with Supabase as the backend (database, storage, realtime).

## Architecture

- **Frontend:** Astro static site in `./basics/` (deployed to GitHub Pages)
- **Admin Panel:** React SPA in `./admin/` (separate dev server)
- **Backend:** Supabase (PostgreSQL database, Storage, Realtime)

## Develop locally

### Frontend (wedding site)
```bash
cd basics
npm install
npm run dev
```

### Admin panel
```bash
cd admin
npm install
npm run dev
```

## Environment Variables

Create `.env` files from the examples:

**`basics/.env`:**
```
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**`admin/.env`:**
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Supabase Setup

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for full instructions on creating tables, storage buckets, and RLS policies.

## Deploy to GitHub Pages

1. Push to `main` branch
2. GitHub Actions workflow (`.github/workflows/deploy.yml`) builds and deploys automatically
3. Site available at `https://hugoalmeida23.github.io/casamento_taniaemiguel/`

## Features

- 🎉 Wedding landing page with countdown, ceremony details, timeline, gallery
- 📸 Live photo gallery (guests upload photos during the event via Supabase)
- 🪑 Table finder with interactive floor plan
- 📋 RSVP form with companion management
- 👔 Dress code, gift list, FAQ, location sections
- 🔧 Admin panel for guest/table/photo management
