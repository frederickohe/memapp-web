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
- Admin login: http://localhost:5173/admin/login
- Admin dashboard: http://localhost:5173/admin/dashboard

## Build

```bash
npm run build
```

Output is written to `dist/`. Caddy serves this folder for both `ymemberapp.com` and `admin.ymemberapp.com`.

## CI/CD

Pushes to `main` run GitHub Actions: production build, upload to the VPS, restart Caddy, then health-check `admin.ymemberapp.com`.

One-time secrets (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`):

```bash
gh auth login
bash scripts/setup-github-secrets.sh
```

## Environment

Copy `.env.example` to `.env.local` and adjust as needed:

```bash
VITE_API_BASE_URL=http://localhost:3090
```

The admin login page calls `POST /api/v1/auth/admin/signin` and loads the profile from `GET /api/v1/auth/admin/me`.
