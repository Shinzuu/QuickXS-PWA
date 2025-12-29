# Admin Panel Setup Guide

## ✅ Admin Panel is Built!

Your custom admin panel is now fully functional. Follow these steps to set it up.

---

## Step 1: Enable Supabase Authentication

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your QuickXS project**
3. **Go to Authentication > Providers**
4. **Enable "Email" provider**:
   - Toggle "Enable Email provider" ON
   - Save changes

---

## Step 2: Configure Database Policies

1. **Go to SQL Editor** in Supabase Dashboard
2. **Run the setup script**:
   - Open `supabase-setup.sql` in this project
   - Copy all the SQL code
   - Paste into Supabase SQL Editor
   - Click "Run"

This will allow authenticated users to create/update/delete data.

---

## Step 3: Create Admin User

1. **Go to Authentication > Users** in Supabase Dashboard
2. **Click "Add User" or "Invite User"**
3. **Enter your admin credentials**:
   - Email: `your-email@example.com`
   - Password: `YourSecurePassword123!`
   - Check "Auto Confirm User" (optional, recommended for first admin)
4. **Click "Create User"**

---

## Step 4: Test the Admin Panel

### Local Testing:
```bash
npm run dev
```

Then visit: **http://localhost:5173/admin/login**

### Production Testing:
After deployment, visit: **https://your-app.netlify.app/admin/login**

**Login** with the email and password you created in Step 3.

---

## Admin Panel Features

### Dashboard (`/admin`)
- **Stats Overview**: Total classes, events, links
- **Upcoming Events**: See next 5 events
- **Quick Actions**: Add class/event/link buttons

### Classes Management (`/admin/classes`)
- **View All Classes**: Organized table view
- **Add New Class**: Click "+ Add Class"
- **Edit Class**: Click "Edit" on any class
- **Delete Class**: Click "Delete" (with confirmation)

**Fields**:
- Day (Saturday-Wednesday)
- Time (HH:MM format)
- Subject
- Teacher
- Classroom
- Duration (minutes)

### Events Management (`/admin/events`)
- **View All Events**: Card-based layout
- **Add New Event**: Click "+ Add Event"
- **Edit Event**: Click "Edit" button
- **Mark Complete/Incomplete**: Toggle button
- **Delete Event**: Click "Delete"

**Fields**:
- Event Name
- Date & Time
- Additional Info (optional)
- Event Type (CT, Mid, Assignment, Lab, etc.)
- Priority (urgent, normal, low)
- Completed status

### Links Management (`/admin/links`)
- **View All Links**: Grid layout
- **Add New Link**: Click "+ Add Link"
- **Edit Link**: Click "Edit"
- **Delete Link**: Click "Delete"

**Fields**:
- Link Title
- URL
- Category (e.g., "study", "resources", "tools")

---

## Security

### What's Protected:
- ✅ All admin routes require authentication
- ✅ Database writes require valid Supabase auth token
- ✅ Passwords hashed by Supabase
- ✅ Session management handled automatically
- ✅ HTTPS enforced in production

### Best Practices:
1. **Use strong passwords** (12+ characters, mixed case, numbers, symbols)
2. **Don't share admin credentials**
3. **Use environment variables** for sensitive data
4. **Enable 2FA** in Supabase (if available)
5. **Regularly update dependencies**

---

## Troubleshooting

### "Failed to load" errors:
- **Check**: Supabase URL and Anon Key in `.env`
- **Verify**: RLS policies are created (run supabase-setup.sql)
- **Confirm**: User is authenticated (check browser console)

### Can't login:
- **Verify**: Email provider is enabled in Supabase
- **Check**: User exists in Authentication > Users
- **Try**: Reset password in Supabase Dashboard

### Changes not saving:
- **Verify**: RLS policies allow authenticated writes
- **Check**: Browser console for errors
- **Confirm**: Network tab shows 200 OK responses

### Page not found:
- **Build**: Run `npm run build` to include new routes
- **Deploy**: Push to GitHub (Netlify auto-deploys)
- **Wait**: Give Netlify 1-2 minutes to build

---

## Accessing Admin Panel

### Local Development:
```
http://localhost:5173/admin/login
```

### Production (after deployment):
```
https://your-app.netlify.app/admin/login
```

### Quick Links:
- Dashboard: `/admin`
- Classes: `/admin/classes`
- Events: `/admin/events`
- Links: `/admin/links`
- Logout: Click "Logout" in top nav
- Back to App: Click "View App" in nav

---

## Deployment

The admin panel is **automatically deployed** with your main app!

### To Deploy:
```bash
git add .
git commit -m "feat: Add custom admin panel"
git push origin main
```

Netlify will:
1. Detect the push
2. Run `npm run build`
3. Deploy to production
4. Admin panel available at `/admin`

**No extra configuration needed!**

---

## Mobile Responsive

The admin panel is fully responsive:
- ✅ Desktop: Full navigation bar
- ✅ Tablet: Adaptive layout
- ✅ Mobile: Hamburger menu, touch-friendly

---

## Data Flow

```
Admin Login
    ↓
Supabase Auth (email/password)
    ↓
Admin Panel (protected routes)
    ↓
API Calls (routinesApi, eventsApi, linksApi)
    ↓
Supabase Database (with RLS)
    ↓
Public PWA (reads data)
```

---

## Future Enhancements

Want to add more features? Easy!

### Ideas:
- **User Roles**: Super admin vs editor
- **Bulk Import**: CSV upload for classes
- **Activity Log**: Track who changed what
- **Search**: Find classes/events quickly
- **Filters**: By date, type, status
- **Export**: Download data as JSON/CSV

All the foundation is there - just extend the existing components!

---

## Need Help?

### Resources:
- **Supabase Docs**: https://supabase.com/docs
- **SvelteKit Docs**: https://kit.svelte.dev/docs
- **This Project's Docs**: See `PROJECT_DOCUMENTATION.md`

### Common Tasks:

**Add new field to class**:
1. Update database schema in Supabase
2. Update `routinesApi.js` (add field)
3. Update class form in `/admin/classes/+page.svelte`

**Change admin theme**:
- Edit colors in `/admin/+layout.svelte` and page files
- Currently uses Midnight theme (#222831, #393E46, #00ADB5)

**Add new admin page**:
1. Create `/src/routes/admin/yourpage/+page.svelte`
2. Add link in `/admin/+layout.svelte` nav
3. Create API functions in `/lib/admin/` if needed

---

## Summary

**You now have**:
- ✅ Full admin panel with authentication
- ✅ CRUD operations for classes, events, links
- ✅ Responsive design (works on all devices)
- ✅ Secure (RLS + Supabase Auth)
- ✅ Auto-deploys with your app

**Next steps**:
1. Run `supabase-setup.sql` in Supabase
2. Create admin user
3. Login and test!

**Login URL**: https://your-app.netlify.app/admin/login

---

🎉 **Enjoy your fully automated admin panel!**
