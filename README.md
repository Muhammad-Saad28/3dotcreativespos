# 3Dot Creatives POS & Restaurant Management System

An ultra-responsive, offline-first Point of Sale (POS) and Restaurant Management ecosystem engineered for **3Dot Creatives** ([3dotcreatives.agency](https://3dotcreatives.agency)).

## Brand Identity & Aesthetic
- **Brand**: 3Dot Creatives
- **Color Palette**:
  - `Obsidian Forest`: `#0d0f0c` (Deep dark background)
  - `Card Surface`: `#171b13` (Sleek container surfaces)
  - `Cream`: `#fdf6e3` (Primary text & typography)
  - `Beige`: `#d8c3a5` (Secondary & muted typography)
  - `Rust Gold`: `#c87740` (Primary brand accent, buttons & highlights)
  - `Olive Green`: `#59613b` (Secondary accents & borders)

## Roles & Interfaces
1. **Admin Management Suite** (`/admin/dashboard`): Real-time sales ledger, purchasing bills, inventory stocks, recipe costing, staff approvals, and 9 analytical reports.
2. **Cashier Terminal** (`/cashier/pos`, `/cashier/dashboard`): High-speed barcode scanning, keyboard hotkeys (F1-F12, Alt+shortcuts), held carts, split bills, and thermal receipt printing.
3. **Kitchen Display System (KDS)** (`/kitchen/dashboard`): Live order tickets, preparation timer badges, audio chimes, and KOT dispatch printing.
4. **Waiter Floor App** (`/waiter/dashboard`, `/waiter/orders`): Table management, mobile cart creation, and status monitoring.
5. **Rider App** (`/rider/dashboard`): Delivery queue, direct customer WhatsApp dispatch notifications, and proof-of-delivery updates.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the POS portal.

### Desktop App (Electron)

```bash
# Run local desktop app
npm run desktop:dev

# Build distributable installer
npm run desktop:dist
```
