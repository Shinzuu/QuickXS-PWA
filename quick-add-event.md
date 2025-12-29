# Quick Way to Add ML Quiz Event

## Option 1: Use the Admin Panel (EASIEST!)

1. **Start dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Go to**: http://localhost:5173/admin/events

3. **Click "+ Add Event"**

4. **Fill in the form**:
   - **Event Name**: ML Quiz - Cocktail Party Problem
   - **Date**: [Select next ML class date - check your schedule]
   - **Time**: [Same time as ML class]
   - **Additional Info**: Quiz on the Cocktail Party Problem (Unsupervised Learning)
   - **Event Type**: CT
   - **Priority**: urgent

5. **Click "Create"**

Done! Event added instantly.

---

## Option 2: Use Supabase Studio

1. **Go to**: https://supabase.com/dashboard
2. **Select**: Your QuickXS project  
3. **Go to**: Table Editor → events
4. **Click**: Insert row
5. **Fill in**:
   - date: YYYY-MM-DD (next ML class date)
   - time: HH:MM (ML class time)
   - name: ML Quiz - Cocktail Party Problem
   - info: Quiz on the Cocktail Party Problem (Unsupervised Learning)
   - event_type: CT
   - priority: urgent
   - is_completed: false
6. **Click**: Save

---

## To Find ML Class Date/Time:

**Check your routines table**:
1. Admin panel: http://localhost:5173/admin/classes
2. Find the ML (Machine Learning) class
3. Note the day and time
4. Calculate next occurrence of that day

**OR**

Supabase Studio → routines table → Filter by subject containing "ML"

---

## Missing .env File?

Create `.env` file in project root:

```bash
VITE_SUPABASE_URL=https://gymdfwvseuhsusyfsnpb.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_key_here
ADMIN_EMAIL=your_email@example.com
```

(Get keys from Supabase Dashboard → Settings → API)

---

**Recommendation**: Use **Admin Panel** - it's already built and ready to use!
