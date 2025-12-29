-- QuickXS PWA - Supabase Admin Setup
-- Run this in Supabase SQL Editor to enable admin panel authentication

-- Enable authenticated users to write to all tables
-- (Public read access already exists)

-- ROUTINES table
CREATE POLICY "Allow authenticated writes on routines"
  ON routines
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- EVENTS table
CREATE POLICY "Allow authenticated writes on events"
  ON events
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- LINKS table
CREATE POLICY "Allow authenticated writes on links"
  ON links
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create an admin user (you'll need to do this in Supabase Dashboard > Authentication > Users)
-- OR run this command after enabling email auth:
--
-- 1. Go to Supabase Dashboard > Authentication > Providers
-- 2. Enable "Email" provider
-- 3. Go to Authentication > Users
-- 4. Click "Add User"
-- 5. Enter:
--    Email: YOUR_EMAIL_HERE
--    Password: YOUR_SECURE_PASSWORD_HERE
-- 6. Confirm
--
-- Then you can login at: https://your-app.netlify.app/admin/login
