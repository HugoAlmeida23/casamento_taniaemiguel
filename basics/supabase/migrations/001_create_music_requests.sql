CREATE TABLE music_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  guest_name VARCHAR(100) NOT NULL,
  song_artist VARCHAR(200) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE music_requests ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (for guest form submissions)
CREATE POLICY "Allow anonymous inserts" ON music_requests
  FOR INSERT WITH CHECK (true);

-- Allow authenticated reads (for admin panel)
CREATE POLICY "Allow authenticated reads" ON music_requests
  FOR SELECT USING (auth.role() = 'authenticated');
