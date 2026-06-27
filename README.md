# memapp-web

Single React app for the **Ymca Member App** public website and admin dashboard.

## Domains

| Host | App |
|---|---|
| `ymemberapp.com` | Public member website |
| `admin.ymemberapp.com` | Admin dashboard |

Both hosts serve the same production build. Routing is based on hostname.

## Requirements

- **Node.js 20.19+** (Vite 8 does not support Node 18)

## Local development

```bash
npm install
npm run dev
```

- Website: http://localhost:5173/
- Admin (local path): http://localhost:5173/admin

## Build

```bash
npm run build
```

Output is written to `dist/`. Caddy serves this folder for both `ymemberapp.com` and `admin.ymemberapp.com`.

## Environment

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
VITE_API_BASE_URL=https://api.ymemberapp.com
```
