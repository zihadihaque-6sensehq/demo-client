# EasyGig Admin — Customers Overview

React + TypeScript UI for the **Customers → Overview** module.

## API (feature contract)

- `GET /customers` — optional `state`, `region`, `activity`, `sort` (default `latestHaulCreated`)
- `POST /customers/export` — body with optional filter fields matching Overview context

Set `VITE_API_BASE_URL` to your API origin (empty uses same-origin paths, with optional Vite proxy).

## Scripts

```bash
npm install
npm run dev
npm run build
```

## Overview behavior

- Skeleton while loading; 60s list cache with background refresh
- State / Region / Activity filters (All + values from list data), Clear Filters on empty match
- System-wide vs filtered empty states; 401 / 403 / 5xx treatments per contract
- Export with success/error toasts; row navigation to Customer Account with filter restoration on back
