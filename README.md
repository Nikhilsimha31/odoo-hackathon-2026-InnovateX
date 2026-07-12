# AssetFlow — Enterprise Asset & Resource Management System

Hey! This is **AssetFlow**, my project for the **Odoo Hackathon 2026 InnovateX**. It's a full-stack web app that helps companies track, manage, and maintain all their physical assets — from laptops and projectors to office furniture. Everything runs locally with no cloud dependency!

---

## What Makes This Project Different

Most hackathon asset trackers are just CRUD tables. AssetFlow goes way beyond that:

- **Tag-and-Stamp Design System** — Every card looks like a physical asset tag, and status changes trigger a real stamping animation
- **Depreciation Calculator** — Automatically calculates asset value over time using straight-line depreciation (the same method real accounting teams use)
- **QR Code Generator** — Every asset gets a unique scan-able QR code, bridging the gap between digital and physical
- **Kanban Board** — Toggle between Grid and Board view to manage assets visually, just like Jira or Trello
- **Dark Mode** — One-click theme toggle that remembers your preference

---

## All Features

### Core Functionality
- **Asset Registration** — Register new assets with auto-generated tag IDs (AF-0001, AF-0002...)
- **Lifecycle Management** — Allocate assets to employees, return them, or send them for maintenance
- **Department Transfer** — Move assets between Engineering, Marketing, HR, Finance, and Operations with full audit logging
- **Maintenance Scheduling** — Submit maintenance requests with descriptions and priority levels (Low / Medium / High)

### Analytics & Monitoring
- **KPI Dashboard** — Real-time cards showing Total Assets, Allocated, Available, and Maintenance counts
- **Donut Chart** — Interactive status breakdown chart powered by Recharts
- **Utilization Rate** — Shows what percentage of your assets are currently allocated
- **Overdue Return Alerts** — Red banner warns when assets haven't been returned in 30+ days
- **Asset Health Score** — Dynamic 0–100 score on every card (Good / Fair / Poor) based on status and age

### Creative / Enterprise Features
- **QR Code Generator** — Unique QR code for every asset tag
- **Asset Journey Timeline** — Full audit trail tracking every action (registered, allocated, transferred, maintained)
- **Depreciation Calculator** — Enter purchase cost + useful life, and the app auto-calculates current value with an animated progress bar
- **CSV Export** — Download all asset data as a spreadsheet in one click
- **Live Notifications Feed** — Bell icon with unread count badge, opens a slide-in drawer showing recent activity across all assets
- **Keyboard Shortcuts** — `/` to search, `R` to register, `K` to toggle board view, `Esc` to clear

---

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Vanilla CSS Modules (no Tailwind) |
| Backend | Node.js, Express.js |
| Database | SQLite (local, offline) |
| ORM | Prisma |
| Charts | Recharts |
| QR Codes | qrcode.react |

---

## How to Run Locally

It's really simple. No cloud setup needed!

```bash
# 1. Install all packages
npm install
cd client && npm install
cd ..

# 2. Run both backend + frontend with one command
npm run dev
```

Open the link shown in your terminal (usually `http://localhost:5173`) and the dashboard loads up!

### Optional: View the Database
```bash
npx prisma studio
```
Opens a visual database browser at `http://localhost:5555` where you can see all the tables and data.

---

## Project Structure
```
oddo/
├── server.js              # Express backend with all API routes
├── prisma/
│   └── schema.prisma      # Database schema (10 models)
├── seed.js                # Seeds initial assets + categories
├── client/                # React (Vite) frontend
│   └── src/
│       ├── App.tsx        # Root app with dark mode state
│       └── components/
│           ├── Dashboard.tsx         # Main dashboard with KPIs, charts, grid, kanban
│           ├── Navbar.tsx            # Top nav with dark mode + notifications
│           ├── TagCard.tsx           # Tag-and-Stamp card component
│           ├── StampBadge.tsx        # Animated status stamp
│           ├── HealthBar.tsx         # Asset health score bar
│           ├── StatusChart.tsx       # Donut chart (Recharts)
│           ├── Modal.tsx             # Reusable animated modal
│           ├── RegisterAssetForm.tsx # Form with cost + department
│           └── AssetActionForm.tsx   # Actions, depreciation, transfer, timeline
└── package.json
```

---

Built with ❤️ for the Odoo Hackathon 2026 by **Team InnovateX**
