# PAJOY SYSTEM - Quick Start Guide

## 🚀 Starting the Desktop App (Easiest Way)

### Windows
Double-click **`launch.bat`** in the project folder. That's it! The entire app will:
- Install dependencies (if needed)
- Build the frontend (if needed)
- Start the backend automatically
- Launch the desktop application

### macOS / Linux
Run the launcher:
```bash
chmod +x launch.sh
./launch.sh
```

---

## 📦 Alternative: Manual Commands

If the launcher doesn't work, use these commands:

### First Time Setup
```bash
npm install
npm run build        # Build frontend for production
```

### Start the App
```bash
npm start            # Opens the desktop app with backend running automatically
```

### Development Mode (with Hot Reload)
```bash
npm run dev          # Runs backend, frontend dev server, and Electron together
```

---

## 🔧 Project Structure

```
pajoy/
├── electron/          → Desktop app configuration
│   ├── main.js       → Electron main process (starts backend, launches UI)
│   └── preload.js    → Secure bridge between app and Node.js
├── backend/          → Express server (automatically started by Electron)
│   ├── server.js     → Main server file
│   └── routes/       → API endpoints
├── frontend/         → React UI
│   ├── src/          → Source code
│   └── dist/         → Built app (created after npm run build)
├── database/         → SQLite database
├── launch.bat        → Windows launcher (double-click to start)
└── launch.sh         → Mac/Linux launcher

```

---

## 💡 What Happens When You Start the App

1. **Electron starts** and calls `electron/main.js`
2. **Backend automatically starts** on port 5179
3. **Frontend loads** (built version in production, dev server in development)
4. **UI displays** once backend is ready
5. **You see the PAJOY login screen**

---

## 👤 Default Login Credentials

After first run, use these to test:
- **Username:** `cashier`
- **Password:** `cashier123`

Other users available:
- `admin` / `admin123` (full access)
- `manager` / `manager123` (management)
- `embroid` / `prod123` (production)
- `store` / `store123` (inventory)

---

## 🛠️ Development Tips

### Work on Frontend (with hot reload)
```bash
npm run dev:frontend    # Runs Vite dev server on port 5173
npm run dev:backend     # In another terminal, runs backend with nodemon
npm run dev:electron    # In another terminal, launches Electron
```

Or use this shortcut:
```bash
npm run dev             # Runs all three together with concurrently
```

### Work on Backend Only
```bash
npm run dev:backend     # Backend with auto-reload on file changes
```

### Build for Production
```bash
npm run build           # Builds frontend
npm run dist:win        # Creates Windows installer
npm run dist:mac        # Creates Mac installer
npm run dist:linux      # Creates Linux package
```

---

## 📝 Available Scripts

| Command | Purpose |
|---------|---------|
| `npm start` | **Launch desktop app (recommended)** |
| `npm run dev` | Full development mode (backend + frontend + Electron) |
| `npm run dev:quick` | Quick dev mode (assumes services running) |
| `npm run build` | Build frontend for production |
| `npm run seed` | Populate database with sample data |
| `npm run dist:win` | Create Windows installer |

---

## 🗄️ Database

- **Location (Development):** `database/pajoy.db`
- **Location (Production/After Install):** `%APPDATA%/PAJOY System/pajoy-db/pajoy.db`
- **Type:** SQLite 3
- **Auto-initialized:** Yes - creates tables on first run

---

## ⚙️ Configuration

Backend runs on: **http://localhost:5179**

Frontend in production loads from the built files in `frontend/dist/`

Backend credentials configured via environment variables (in production deployment)

---

## 🎯 First Time Running

1. **Run `launch.bat` or `launch.sh`**
2. **Wait for the window to open** (~5-10 seconds first time)
3. **Log in** with `cashier` / `cashier123`
4. **Start using the app!**

---

## ❓ Troubleshooting

### "Backend failed to start"
- Check if port 5179 is already in use
- Try restarting the app
- Check logs in the console (Ctrl+Shift+I in the app)

### "Frontend not loading"
- Wait a bit longer (first build can take time)
- Check if `frontend/dist` folder exists
- Try running `npm run build` manually

### "Database errors"
- Delete `database/pajoy.db` and restart (creates fresh copy)
- Run `npm run seed` to repopulate sample data

### "Node.js not found"
- Install Node.js from https://nodejs.org
- Make sure it's added to your PATH
- Restart your terminal/computer

---

## 🚀 Deployment

See [MPESA_DEPLOYMENT_GUIDE.md](MPESA_DEPLOYMENT_GUIDE.md) for server deployment instructions.

For desktop app distribution, use the built installers from `npm run dist:win/mac/linux`

---

**Questions?** Check the console output or contact support.

Happy selling! 📱💼
