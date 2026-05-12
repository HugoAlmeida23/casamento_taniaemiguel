# Supabase Setup — Wedding Website (Full Migration)

This guide walks you through setting up all Supabase infrastructure for the wedding website. After this setup, the Express server is no longer needed — everything runs directly against Supabase.

## Prerequisites

- A Supabase account at [supabase.com](https://supabase.com)
- A Supabase project created for this wedding website

## Step 1: Get Your Project Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings → API**
3. Copy the **Project URL** and **anon/public key**
4. Add them to your environment files:

**`basics/.env`** (for the Astro frontend):
```
PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**`admin/.env`** (for the admin panel):
```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 2: Create the `guests` Table

```sql
CREATE TABLE guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  email TEXT,
  telefone TEXT,
  acompanha INTEGER DEFAULT 0,
  restricoes TEXT,
  mesa_id UUID REFERENCES tables(id),
  companions JSONB DEFAULT '[]',
  mensagem TEXT,
  qr_code TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  checked_in INTEGER DEFAULT 0,
  checkin_time TIMESTAMPTZ
);
```

## Step 3: Create the `tables` Table

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 8
);
```

> **Note:** Create the `tables` table BEFORE `guests` since `guests.mesa_id` references it. Or remove the foreign key constraint if you prefer flexibility.

## Step 4: Create the `photos` Table

```sql
CREATE TABLE photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  uploader_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_visible BOOLEAN NOT NULL DEFAULT true
);
```

## Step 5: Enable Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE photos;
```

## Step 6: Configure Row Level Security (RLS)

### Guests table
```sql
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

-- Anyone can read guests (for mesa page search)
CREATE POLICY "Public can view guests"
  ON guests FOR SELECT USING (true);

-- Anyone can insert (RSVP form)
CREATE POLICY "Anyone can RSVP"
  ON guests FOR INSERT WITH CHECK (true);

-- Anyone can update (for admin — in production, restrict to authenticated users)
CREATE POLICY "Anyone can update guests"
  ON guests FOR UPDATE USING (true);

-- Anyone can delete (for admin)
CREATE POLICY "Anyone can delete guests"
  ON guests FOR DELETE USING (true);
```

### Tables table
```sql
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Anyone can read tables
CREATE POLICY "Public can view tables"
  ON tables FOR SELECT USING (true);

-- Anyone can insert/update/delete (for admin)
CREATE POLICY "Anyone can manage tables"
  ON tables FOR ALL USING (true);
```

### Photos table
```sql
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view visible photos"
  ON photos FOR SELECT USING (is_visible = true);

CREATE POLICY "Anyone can upload photos"
  ON photos FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can delete photos"
  ON photos FOR DELETE USING (true);
```

## Step 7: Create the Storage Bucket

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Configure:
   - **Name:** `wedding-photos`
   - **Public:** ✅ Enabled
   - **File size limit:** 10 MB
   - **Allowed MIME types:** `image/jpeg`, `image/png`, `image/heic`, `image/webp`

## Step 8: Configure Storage Policies

```sql
-- Allow anyone to read files
CREATE POLICY "Public read access"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'wedding-photos');

-- Allow anyone to upload files
CREATE POLICY "Anyone can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'wedding-photos');

-- Allow anyone to delete files (for admin moderation)
CREATE POLICY "Anyone can delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'wedding-photos');
```

## Step 9: Seed Initial Data (Optional)

If you want to pre-populate tables:

```sql
INSERT INTO tables (name, capacity) VALUES
  ('Mesa 1', 8),
  ('Mesa 2', 8),
  ('Mesa 3', 6),
  ('Mesa 4', 6),
  ('Mesa dos Noivos', 10);
```

## Step 10: Enable Image Transforms (Optional)

For thumbnail generation via URL parameters:
1. Go to **Storage → Settings**
2. Ensure **Image Transformations** is enabled

## Verification Checklist

- ✅ `guests` table exists with correct columns
- ✅ `tables` table exists with correct columns
- ✅ `photos` table exists with correct columns
- ✅ Realtime enabled on `photos` table
- ✅ RLS policies configured for all tables
- ✅ `wedding-photos` bucket exists and is public
- ✅ Storage policies allow read, upload, and delete
- ✅ Environment variables set in `basics/.env` and `admin/.env`

## Testing

Run the property-based tests:
```bash
cd basics
npm install
npm test
```

Start the frontend (no Express server needed!):
```bash
cd basics
npm run dev
```

Start the admin panel:
```bash
cd admin
npm install
npm run dev
```
