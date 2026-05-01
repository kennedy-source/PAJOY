# PAJOY System - Desktop App Architecture

## 🏗️ How It Works

```
┌─────────────────────────────────────────────────────────────┐
│                      USER CLICKS LAUNCH                      │
│                    (launch.bat or npm start)                 │
└─────────────────────────────────────┬───────────────────────┘
                                      │
                   ┌──────────────────▼──────────────────┐
                   │   Electron Main Process Starts      │
                   │   (electron/main.js)                │
                   └──────────────────┬──────────────────┘
                                      │
                ┌─────────────────────┼─────────────────────┐
                │                     │                     │
      ┌─────────▼─────────┐  ┌────────▼────────┐  ┌────────▼────────┐
      │ Database Ready    │  │ Backend Starts  │  │ Frontend Loads  │
      │ (SQLite via       │  │ (Express on     │  │ (React UI)      │
      │ better-sqlite3)   │  │ localhost:5179) │  │                 │
      └─────────┬─────────┘  └────────┬────────┘  └────────┬────────┘
                │                     │                     │
                └─────────────────────┼─────────────────────┘
                                      │
                   ┌──────────────────▼──────────────────┐
                   │   All Services Ready?               │
                   │   ✓ Backend healthy                 │
                   │   ✓ Frontend loaded                 │
                   └──────────────────┬──────────────────┘
                                      │
                   ┌──────────────────▼──────────────────┐
                   │   Show Window with Login Screen     │
                   └─────────────────────────────────────┘
```

## 📦 Components & Flow

### 1. **Electron Main Process** (`electron/main.js`)
- Starts on app launch
- Spawns backend process (development) or includes it (production)
- Waits for backend health check
- Loads React UI (dev server or built files)
- Manages window lifecycle
- Handles DB backup/restore via IPC

### 2. **Express Backend** (`backend/server.js`)
- **Port:** 5179 (localhost only - secure)
- **Database:** SQLite (better-sqlite3)
- **Routes:** All API endpoints (products, sales, customers, etc.)
- **Auto-started:** By Electron main process
- **Production:** Runs in-process (no separate Node binary needed)

### 3. **React Frontend** (`frontend/src/`)
- **Dev:** Vite dev server on port 5173
- **Production:** Pre-built static files in `frontend/dist/`
- **API:** Connects to backend via `http://127.0.0.1:5179`
- **UI:** Login → Dashboard → Various modules

### 4. **Database** (`database/pajoy.db`)
- SQLite 3 file-based database
- Schema defined in `database/init.sql`
- Auto-created on first run
- Data synced to user's local app data folder (production)

## 🔄 Development vs Production

### **Development Mode**
```
npm run dev    (or npm run dev:electron)

┌─────────┐     ┌──────────┐     ┌────────────┐
│ Backend │     │ Frontend │     │  Electron  │
│ :5179   │ ◄─► │ Vite     │ ◄─► │   Main     │
│ nodemon │     │ :5173    │     │   Dev      │
└─────────┘     └──────────┘     └────────────┘
(auto-reload)   (hot reload)     (dev tools)
```

### **Production Mode** 
```
npm start    (or npm run dist:win)

┌─────────────────────┐
│   Electron App      │
│  ┌───────────────┐  │
│  │  Backend      │  │
│  │ (in-process)  │  │
│  └───────────────┘  │
│  ┌───────────────┐  │
│  │  Frontend     │  │
│  │  (built dist) │  │
│  └───────────────┘  │
└─────────────────────┘
(Single portable executable)
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `launch.bat` | Double-click to start app (Windows) |
| `launch.sh` | Bash launcher (macOS/Linux) |
| `setup.bat` | First-time setup & dependency install |
| `electron/main.js` | Electron main process (starts backend + UI) |
| `electron/preload.js` | Secure bridge to Node.js APIs |
| `backend/server.js` | Express server |
| `frontend/src/` | React components and pages |
| `database/pajoy.db` | SQLite database |
| `package.json` | NPM scripts and dependencies |

## 🚀 Startup Process (Detailed)

1. **User double-clicks `launch.bat`**
   - Checks for `node_modules` (installs if missing)
   - Checks for built frontend (builds if missing)
   - Runs `npm start`

2. **`npm start` → `electron .`**
   - Electron loads `electron/main.js`

3. **Main Process Initializes**
   ```javascript
   app.whenReady().then(async () => {
     startBackend();           // Spawn backend on :5179
     if (isDev) {
       await checkBackendHealthy();  // Wait for backend
     }
     createWindow();           // Show window
   })
   ```

4. **Backend Starts**
   - Initializes SQLite database
   - Loads Express routes
   - Listens on 127.0.0.1:5179
   - Prints: `[PAJOY] backend running on port 5179`

5. **Window Created & Frontend Loads**
   - Dev: `http://localhost:5173` (Vite dev server)
   - Prod: `frontend/dist/index.html` (built files)

6. **Frontend Initializes**
   - Checks API health: `GET /api/health`
   - If not logged in, shows Login page
   - On successful login, shows Dashboard

7. **User Sees the App** ✓

## 🔒 Security

- **Backend:** Localhost-only (no remote access)
- **Database:** SQLite in user's app data folder
- **Passwords:** Hashed with bcryptjs
- **Session:** Token-based auth
- **IPC:** Context isolation enabled
- **Sandbox:** Frontend runs in sandbox

## 📊 Ports & Endpoints

| Component | Port | URL | Purpose |
|-----------|------|-----|---------|
| Backend | 5179 | http://127.0.0.1:5179 | API server |
| Frontend (Dev) | 5173 | http://localhost:5173 | Vite dev server |
| Frontend (Prod) | - | Built static files | Desktop app UI |

## 🛠️ Troubleshooting Quick Guide

| Issue | Cause | Fix |
|-------|-------|-----|
| Window won't open | Backend didn't start | Check port 5179 is free, restart |
| API calls fail | Backend not running | Run `npm run dev:backend` separately |
| Blank screen | Frontend not built | Run `npm run build` |
| Permission error | Node modules corrupt | Delete `node_modules`, run `npm install` |
| Database error | DB file corrupted | Delete `database/pajoy.db`, restart |

## 📦 Building for Distribution

```bash
# Windows EXE installer
npm run build && npm run dist:win
# Output: release/PAJOY-Setup-1.0.0.exe

# macOS DMG installer
npm run build && npm run dist:mac
# Output: release/PAJOY-System-1.0.0.dmg

# Linux AppImage
npm run build && npm run dist:linux
# Output: release/PAJOY-System-1.0.0.AppImage
```

---

**That's it!** The entire app is self-contained and automatically starts everything. Users just need to double-click `launch.bat` 🚀
