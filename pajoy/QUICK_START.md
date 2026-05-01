# 🚀 PAJOY System - Get Started in 30 Seconds

## For End Users (Just want to run the app)

### Windows
1. **Find the `launch.bat` file** in the PAJOY folder
2. **Double-click it** ↔️ Done! The app opens automatically
3. **Log in** with: `cashier` / `cashier123`

### Mac/Linux
1. **Open terminal** and go to the PAJOY folder
2. **Run:** `./launch.sh`
3. **Log in** with: `cashier` / `cashier123`

**That's it!** Backend starts automatically. No manual commands needed.

---

## For Developers

### First Time Setup (One-time)

**Windows:**
```batch
# Double-click setup.bat
# OR in PowerShell:
.\setup.bat
```

**Mac/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

This will:
- ✓ Install Node.js dependencies
- ✓ Build the frontend
- ✓ Create sample database with demo data

### Running the App

**Easy (Recommended):**
```bash
npm start
```

**Development (with hot reload):**
```bash
npm run dev
```

**Just backend:**
```bash
npm run dev:backend
```

**Just frontend:**
```bash
npm run dev:frontend
```

### Building for Distribution

```bash
# Windows installer (.exe)
npm run dist:win

# Mac installer (.dmg)
npm run dist:mac

# Linux package (.AppImage)
npm run dist:linux
```

---

## 📊 Default Test Accounts

| Username | Password | Role |
|----------|----------|------|
| admin | admin123 | Administrator |
| manager | manager123 | Manager |
| cashier | cashier123 | Cashier ← Use this |
| embroid | prod123 | Production |
| store | store123 | Store Keeper |

---

## 🔧 Behind the Scenes

When you click `launch.bat`:

1. ✓ Checks Node.js is installed
2. ✓ Installs dependencies if needed
3. ✓ Builds frontend if needed
4. ✓ Starts backend server (port 5179)
5. ✓ Opens the desktop app
6. ✓ Backend automatically connects
7. ✓ You see the login screen

No manual terminals needed! Everything is automated.

---

## ❓ Something Not Working?

### App won't start
```bash
# Try this:
npm install
npm run build
npm start
```

### Database issue
```bash
# Reset the database:
npm run seed
npm start
```

### Port 5179 in use
```bash
# Find what's using port 5179 and kill it, then:
npm start
```

### Need to see detailed logs
- Open DevTools: `Ctrl+Shift+I` in the app
- Check "Console" tab for errors
- Check terminal output for backend logs

---

## 📁 What Got Installed

```
pajoy/
├── node_modules/          ← Dependencies (created by npm install)
├── frontend/dist/         ← Built app (created by npm run build)
├── database/pajoy.db      ← Your data (created by npm run seed)
├── launch.bat             ← ← ← DOUBLE CLICK TO START
└── launch.sh              ← ← ← Or run this on Mac/Linux
```

---

## 🎯 Common Tasks

| Task | Command |
|------|---------|
| **Start the app** | `npm start` |
| **Develop with hot reload** | `npm run dev` |
| **Create demo data** | `npm run seed` |
| **Reset database** | Delete `database/pajoy.db`, then `npm run seed` |
| **Build for sharing** | `npm run dist:win` (creates installer) |
| **Update dependencies** | `npm install` |

---

## 🎓 Learning More

- **Full architecture details:** See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Desktop app guide:** See [DESKTOP_APP_GUIDE.md](DESKTOP_APP_GUIDE.md)
- **Main README:** See [README.md](README.md)

---

**Questions?** Check the logs in DevTools (Ctrl+Shift+I in the app) or look at [DESKTOP_APP_GUIDE.md](DESKTOP_APP_GUIDE.md) for troubleshooting.

🎉 **You're ready to go!**
