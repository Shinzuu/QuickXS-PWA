-- QuickXS PWA - Supabase Admin Panel Setup
-- Run this in Supabase SQL Editor to enable secure admin authentication

-- ============================================
-- STEP 1: Enable Row Level Security (RLS)
-- ============================================
-- Already enabled on your tables, but let's verify:

ALTER TABLE routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: Drop any existing policies (clean slate)
-- ============================================

DROP POLICY IF EXISTS "Public read access for routines" ON routines;
DROP POLICY IF EXISTS "Public read access for events" ON events;
DROP POLICY IF EXISTS "Public read access for links" ON links;
DROP POLICY IF EXISTS "Allow authenticated writes on routines" ON routines;
DROP POLICY IF EXISTS "Allow authenticated writes on events" ON events;
DROP POLICY IF EXISTS "Allow authenticated writes on links" ON links;

-- ============================================
-- STEP 3: Create READ policies (public access)
-- ============================================
-- Anyone can read the data (for your PWA)

CREATE POLICY "Public read access for routines"
  ON routines FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for events"
  ON events FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Public read access for links"
  ON links FOR SELECT
  TO anon, authenticated
  USING (true);

-- ============================================
-- STEP 4: Create WRITE policies (authenticated only)
-- ============================================
-- Only authenticated users can create, update, delete

-- ROUTINES
CREATE POLICY "Authenticated users can insert routines"
  ON routines FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update routines"
  ON routines FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete routines"
  ON routines FOR DELETE
  TO authenticated
  USING (true);

-- EVENTS
CREATE POLICY "Authenticated users can insert events"
  ON events FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update events"
  ON events FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete events"
  ON events FOR DELETE
  TO authenticated
  USING (true);

-- LINKS
CREATE POLICY "Authenticated users can insert links"
  ON links FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update links"
  ON links FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete links"
  ON links FOR DELETE
  TO authenticated
  USING (true);

-- ============================================
-- DONE! Next steps:
-- ============================================
-- 1. Go to Authentication → Providers
-- 2. Verify "Email" is enabled (it should be by default)
-- 3. Go to Authentication → Users
-- 4. Click "Add User"
-- 5. Create your admin account:
--    - Email: your-email@example.com
--    - Password: your-secure-password
--    - Auto Confirm User: ✓ (check this!)
-- 6. Click "Create User"
-- 7. Test login at: https://puic.netlify.app (click 🔧 Admin Panel)
