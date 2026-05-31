# Deployment guide (Neon + Render + Vercel)

This guide deploys the **Cute Art Webshop** using free tiers:

| Part | Service | URL you get |
|------|---------|-------------|
| Database | [Neon](https://neon.tech) | `DATABASE_URL` connection string |
| Backend API | [Render](https://render.com) | `https://your-api.onrender.com` |
| Frontend | [Vercel](https://vercel.com) | `https://your-app.vercel.app` |

**Fallback (local exam demo):** use Docker — see [Docker fallback](#docker-fallback-local-demo) at the bottom.

---

## Prerequisites

- GitHub repo pushed (e.g. `karo4377/fullstack-exam`)
- Accounts on Neon, Render, and Vercel (GitHub login is easiest)

---

## 1. Neon (PostgreSQL)

1. Sign up at [https://neon.tech](https://neon.tech).
2. **New project** → name it `artshop` → region close to you.
3. Open the project → **Connection details** → copy the **connection string** (pooled or direct).
   - It looks like:  
     `postgresql://user:password@ep-xxxx.eu-west-1.aws.neon.tech/neondb?sslmode=require`
4. Create a database named `artshop` if Neon only gives `neondb` — or use the default DB name in the URL.
5. Save this as **`DATABASE_URL`** (you will paste it into Render).

### Run migrations from your laptop (once)

```bash
cd backend
cp .env.example .env
# Edit .env: set DATABASE_URL to your Neon string
npm install
npx prisma migrate deploy
npm run seed
```

You should see ~40 products and test users in the seed output.

---

## 2. Render (NestJS backend)

1. Go to [https://dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**.
2. Connect your GitHub repo `fullstack-exam`.
3. Settings:
   - **Name:** `artshop-api` (or similar)
   - **Region:** same as Neon if possible
   - **Root directory:** `backend`
   - **Runtime:** Node
   - **Build command:** `npm ci && npm run build`  
     (`npm run build` runs `prisma generate` + `nest build`; build tools are in `dependencies` so Render does not skip them.)
   - **Start command:** `npm run start:prod` (runs `node dist/main`)
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `DATABASE_URL` | Your Neon connection string |
   | `JWT_SECRET` | Long random string (e.g. `openssl rand -hex 32`) |
   | `FRONTEND_URL` | `https://YOUR-APP.vercel.app` (set after Vercel deploy) |
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` (Render sets this automatically; optional) |

5. **Optional — run migrations on deploy:**  
   Under **Advanced** → add a **Pre-Deploy Command** (if available) or run migrations manually once:
   ```bash
   DATABASE_URL="..." npx prisma migrate deploy
   DATABASE_URL="..." npm run seed
   ```
6. Click **Create Web Service**. Wait for deploy.
7. Test: open `https://YOUR-SERVICE.onrender.com/api/docs` (Swagger).
8. Test products: `https://YOUR-SERVICE.onrender.com/products` (JSON list).

**Note:** Uploaded images stored on disk are **lost** when Render restarts. For production demos, use placeholder image URLs in seed/admin, or add Cloudinary later.

---

## 3. Vercel (Next.js frontend)

1. Go to [https://vercel.com](https://vercel.com) → **Add New…** → **Project**.
2. Import the same GitHub repo.
3. Settings:
   - **Framework preset:** Next.js
   - **Root directory:** `frontend`
4. **Environment variables:**

   | Key | Value |
   |-----|--------|
   | `NEXT_PUBLIC_API_URL` | `https://YOUR-SERVICE.onrender.com` (Render URL, no trailing slash) |
   | `NEXT_PUBLIC_SITE_URL` | `https://YOUR-APP.vercel.app` (Vercel URL, for sitemap) |

5. Deploy. Copy your production URL from **Settings → Domains** (e.g. `https://fullstack-exam-weld.vercel.app`).

---

## 4. Connect frontend ↔ backend

1. In **Render**, update `FRONTEND_URL` to your exact Vercel URL (no trailing slash).
2. Redeploy the Render service (manual deploy or push a commit).
3. In the browser:
   - Open the Vercel site
   - Register or log in as customer: `customer@artshop.local` / `customer123` (after seed)
   - Admin: `admin@artshop.local` / `admin123`

If login fails:

- Check browser DevTools → Network → login request (CORS / cookies)
- `FRONTEND_URL` must match the site origin exactly
- Cookies use `secure: true` in production (`NODE_ENV=production`)

---

## 5. CI/CD (GitHub Actions)

Already configured in `.github/workflows/ci.yml`:

- On push/PR to `main`: backend tests + build, frontend build
- **Vercel:** enable “Production Branch” = `main` for auto-deploy
- **Render:** enable **Auto-Deploy** on `main`

Work on branch `karolina-work`, merge to `main` when ready to deploy.

---

## 6. WISEflow checklist

Fill `WISEFLOW.md` with:

- GitHub: `https://github.com/karo4377/fullstack-exam`
- Live app: your Vercel URL
- API docs: `https://YOUR-API.onrender.com/api/docs`
- Test accounts (after seed)

Export as PDF if your course requires it.

---

## Docker fallback (local demo)

If cloud hosting fails on exam day, run everything locally with Docker.

**Important:** Do not run `npm run start:dev` / `npm run dev` on your Mac at the same time unless you know which database you are pointing at. Docker brings its own Postgres with user `artshop` / password `artshop`.

```bash
cd fullstack-exam
docker compose up --build
```

Wait until you see the backend log `API listening on http://localhost:3001` and Next.js `Ready`.

| Service | URL |
|---------|-----|
| Frontend | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |
| Postgres (from Mac) | `localhost:5433` — user `artshop`, password `artshop`, db `artshop` |

Postgres is mapped to **5433** on your Mac so it does not clash with an existing Postgres on 5432.

Stop: `Ctrl+C` then `docker compose down`  
Reset DB: `docker compose down -v` then `docker compose up --build`

### Docker troubleshooting

| Problem | Fix |
|---------|-----|
| Frontend build fails on TypeScript | Run `cd frontend && npm run build` locally; fix errors, then `docker compose up --build` again. |
| `Authentication failed` for `artshop` when using **npm** (not Docker) | Your Mac Postgres on 5432 is not the Docker DB. Either use **only** `docker compose up`, or set `DATABASE_URL` to port **5433** if connecting from the host to the Docker Postgres container. |
| Port 5432 already in use | Docker compose uses host port **5433** for Postgres. |
| `cd frontend` fails after `cd backend` | Open a new terminal tab, or run `cd ../frontend` from `backend`. |

**Without Docker** (two terminals + Postgres):

```bash
# Terminal 1 – DB via Docker only
docker run --name postgres-artshop -e POSTGRES_USER=artshop -e POSTGRES_PASSWORD=artshop -e POSTGRES_DB=artshop -p 5432:5432 -d postgres:16

cd backend && cp .env.example .env && npm install
npx prisma migrate deploy && npm run seed && npm run start:dev

cd frontend && echo "NEXT_PUBLIC_API_URL=http://localhost:3001" > .env.local
npm install && npm run dev
```

---

## Cost notes (free tiers)

- **Neon:** free tier with storage/compute limits; fine for exam.
- **Render:** free web service may **sleep** after inactivity (cold start ~30s).
- **Vercel:** generous free hobby tier for Next.js.

Mention cold starts and image upload limitations in your exam presentation if asked.
