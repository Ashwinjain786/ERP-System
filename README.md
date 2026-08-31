# ERP System — Campus Management Platform

A full-stack ERP system for campus management built with **React + Vite** (frontend) and **Node.js + Express + Prisma + PostgreSQL** (backend).

## 🚀 One-Command Docker Launch

> **Prerequisite**: [Docker Desktop](https://www.docker.com/products/docker-desktop/) must be installed and running.

```bash
docker compose up --build
```

Then open your browser at: **http://localhost:8080**

---

## 🔑 Default Login Credentials (seeded automatically)

| Role    | Email                   | Password     |
|---------|-------------------------|--------------|
| Admin   | admin@campus.edu        | admin123     |
| Faculty | faculty@campus.edu      | faculty123   |
| Student | student@campus.edu      | student123   |
| Student | priya@campus.edu        | student123   |

---

## 🏗️ Architecture

```
Browser → http://localhost:8080
         │
         ▼
   [Nginx / React SPA]  :80
         │ /api/* proxy
         ▼
   [Express API]        :3000
         │
         ▼
   [PostgreSQL]         :5432
```

### Services (docker-compose)
| Service | Container    | Purpose                         |
|---------|--------------|---------------------------------|
| `db`    | `erp_db`     | PostgreSQL 16 database          |
| `api`   | `erp_api`    | Node.js / Express REST API      |
| `web`   | `erp_web`    | React SPA served via Nginx      |

### Startup Order
1. **db** starts → healthcheck confirms it's ready
2. **api** starts → runs `prisma db push` + `seed.ts` → starts Express
3. **web** starts → serves static SPA, proxies `/api` to **api**

---

## 🛠️ Development (without Docker)

```bash
# 1. Install dependencies
npm install

# 2. Set up backend .env
# Edit backend/.env with your local PostgreSQL connection string

# 3. Run migrations + seed
cd backend
npx prisma db push
npx ts-node prisma/seed.ts

# 4. Start both servers (from root)
npm run dev
```

Frontend runs at `http://localhost:5173`  
Backend runs at `http://localhost:3000`

## Production SEO and deployment

The frontend is branded as CampusOne and uses `https://campusone.edu` as its canonical public origin. Update the `ORIGIN` constant in `frontend/src/components/shared/SeoManager.tsx`, `frontend/index.html`, `frontend/public/robots.txt`, `frontend/public/sitemap.xml`, and the social-card URLs if the production domain changes. DNS and registrar configuration are intentionally deployment-specific and must point the chosen domain at the web service.

Each routed screen receives a unique title, description, canonical URL, Open Graph/Twitter card metadata, one route heading in the page UI, and CampusOne organization/local-business JSON-LD. Authenticated areas are excluded from crawling because they contain private data. `frontend/public/404.html` is served by the web server fallback through the SPA's branded `NotFound` route.

Builds use route-level lazy loading, split chart and animation chunks, and `sourcemap: false` for production. Validate with `npm.cmd run build`; the existing lint command currently reports legacy errors in untouched pages, so those are tracked separately from this SEO work.

Public machine-readable files are available at `/sitemap.xml`, `/robots.txt`, and `/llms.txt`. Brand assets are `/favicon.svg` and `/social-share.svg`.

---

## 📦 Departments & Features

| Department  | Pages                                          |
|-------------|------------------------------------------------|
| Admin       | Dashboard, Students, Faculty, Admissions, Roles, Notices, Examinations, Academics, Timetable |
| Faculty     | Dashboard, Classes, Attendance, Grading, Leaves, Department |
| Student     | Dashboard, Courses, Attendance, Exams, Fees, Library, Documents, Timetable |
| Library     | Catalog, Circulation, Fines                    |
| Finance     | Structures, Transactions, Dues, Reports        |
| Analytics   | Overview, Admissions, Academic Performance, Placement, Financial Health |
