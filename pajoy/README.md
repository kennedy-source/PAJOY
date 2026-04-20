# PAJOY SYSTEM

Premium offline-first desktop POS, inventory, school-uniform, embroidery and printing management system for Kenyan retail.

## Stack
- **Electron 32** desktop shell (Windows/macOS/Linux)
- **React 18 + Vite** frontend (TypeScript-friendly, JSX shipped)
- **Express 4** local backend (loopback only, listens on 127.0.0.1)
- **SQLite** via `better-sqlite3` — fully offline local database
- **bcryptjs** for password hashing
- **Recharts** for dashboard charts

## Quick start (development)

```bash
npm install
npm run seed     # creates database/pajoy.db with demo data
npm run dev      # runs backend + Vite + Electron together
```

Default logins:
- Username: `admin`, Password: `admin123` (Admin)
- Username: `manager`, Password: `manager123` (Manager)
- Username: `cashier`, Password: `cashier123` (Cashier)
- Username: `embroid`, Password: `prod123` (Production)
- Username: `store`, Password: `store123` (Store Keeper)

## Build a Windows installer (.exe)

On a Windows machine:
```bash
npm install
npm run seed
npm run dist:win
```
Output: `release/PAJOY-Setup-1.0.0.exe`

> `better-sqlite3` is a native module. Run `npm install` on the same OS you intend to ship for. For Windows builds you need Visual Studio Build Tools (`npm install --global windows-build-tools` on older setups, or install the "Desktop development with C++" workload in Visual Studio Installer).

## Project structure

```
pajoy-system/
  electron/          # Electron main + preload (secure contextBridge)
  backend/           # Express server, routes, services
  database/          # init.sql schema + pajoy.db (created by seed)
  scripts/seed.js    # Seeds users, schools, categories, sizes, colours, products, variants, etc.
  frontend/          # React + Vite UI
    src/
      pages/         # Dashboard, POS, Inventory, Schools, Customers, Embroidery, Printing, Reports, Expenses, Suppliers, Settings, Login
      components/    # Reusable UI
      layouts/       # AppLayout (sidebar + topbar)
      services/      # api.js wrapper
      styles/        # global.css (premium dark theme)
```

## Modules implemented

✅ Authentication + roles (Admin, Manager, Cashier, Production Staff, Store Keeper)
✅ Dashboard (today's sales, low stock, pending jobs, charts)
✅ POS (search, cart, discount, cash/M-Pesa, receipt)
✅ Inventory (products, variants by size/colour/school, stock movements, low-stock alerts)
✅ Schools (preloaded Kenyan samples, colours, levels)
✅ Customers
✅ Embroidery jobs (Kanban with full status workflow)
✅ Printing jobs (Kanban with full status workflow)
✅ Suppliers
✅ Expenses (with categories)
✅ Reports (sales, top items, low stock, expenses, profit estimate)
✅ Receipts (printable HTML)
✅ Backup / restore (file-based copy of SQLite DB)
✅ Audit logs + sync_logs schema (ready for future LAN sync)

## Sync architecture (future)

Each row carries `device_id`, `last_modified` (epoch ms), and changes are written to `sync_logs`. A future `backend/services/sync.js` can drain that queue to a peer over LAN. Schema is conflict-safe (last-writer-wins per row, or merge by `sync_logs` id ordering).
