# QuickXS PWA - Student Schedule Manager

[![Build Check](https://github.com/Shinzuu/QuickXS-PWA/actions/workflows/build-check.yml/badge.svg)](https://github.com/Shinzuu/QuickXS-PWA/actions/workflows/build-check.yml)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Shinzuu/QuickXS-PWA)

**Live App**: [https://quickxs.not-shinzuu.workers.dev](https://quickxs.not-shinzuu.workers.dev)

A modern Progressive Web App for managing class schedules, events, and study resources.

## ✨ Features

- 📅 **Class Schedule** - View your weekly timetable
- 🎯 **Events Timeline** - Track assignments, quizzes, and deadlines
- 🔗 **Study Links** - Organize learning resources
- 🎨 **7 Themes** - Choose your style (Midnight, Ocean, Forest, etc.)
- 📱 **PWA** - Install on any device, works offline
- ⚡ **Fast** - 80KB bundle size (gzipped)
- 🔐 **Admin Panel** - Manage content from web browser

## 🚀 Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Visit http://localhost:5173

### Build
```bash
npm run build
```

### Admin Panel
Visit `/admin/login` to manage classes, events, and links.

Setup guide: [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md)

## 📱 Android App

Build an Android APK using TWA:

```bash
# Option 1: PWABuilder (easiest)
Visit https://www.pwabuilder.com/
Enter: https://puic.netlify.app
Generate APK

# Option 2: Local build
npx bubblewrap build
```

Full guide: [TWA_BUILD_GUIDE.md](./TWA_BUILD_GUIDE.md)

## 🏗️ Tech Stack

- **Frontend**: Svelte 5 (Runes mode)
- **Build**: Vite
- **Styling**: TailwindCSS
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Cloudflare Workers (unlimited builds, auto-deploy)
- **PWA**: Vite PWA Plugin

## 📊 Build Status

The project includes automated build checks and deployments on every push:
- ✅ Cloudflare Workers auto-deploy from `main` branch
- ✅ Unlimited builds (no more build minute limits!)
- ✅ GitHub Actions build validation
- ✅ Global CDN with unlimited bandwidth

Build size: ~80KB gzipped ⭐

## 📚 Documentation

- [PROJECT_STATUS.md](./PROJECT_STATUS.md) - Complete project status
- [ADMIN_SETUP_GUIDE.md](./ADMIN_SETUP_GUIDE.md) - Admin panel setup
- [TWA_BUILD_GUIDE.md](./TWA_BUILD_GUIDE.md) - Android app build
- [WIDGET_SOLUTION_2025.md](./WIDGET_SOLUTION_2025.md) - Native widget implementation
- [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md) - Full technical docs

## 🎯 Roadmap

- [x] PWA with offline support
- [x] Admin panel
- [x] Auto-deployment
- [x] TWA configuration
- [ ] Native Android widgets (Jetpack Glance)
- [ ] iOS optimization
- [ ] Play Store publishing

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit changes
4. Push to branch
5. Open a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🔗 Links

- **Live App**: https://quickxs.not-shinzuu.workers.dev
- **Admin Panel**: https://quickxs.not-shinzuu.workers.dev/admin
- **GitHub**: https://github.com/Shinzuu/QuickXS-PWA
- **Issues**: https://github.com/Shinzuu/QuickXS-PWA/issues

---

Built with ❤️ using Svelte 5 and modern web technologies
