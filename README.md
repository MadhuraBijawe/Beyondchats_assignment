BeyondChats Project

Overview

BeyondChats is a small multi-part project used to collect, enhance, and serve articles. It includes:

- a Django backend (API + admin) in the `backend_django` folder
- a Vite + React frontend in the `article-frontend` folder
- a Python scraper and importer in the `scraper-python` folder
- small JS-based enhancer/publisher code under `articles/enhancer`

Requirements

- Python 3.10+ (for Django backend and scraper)
- Node.js 16+ and `npm` or `yarn` (for the frontend and enhancer JS)
- Git and a terminal (PowerShell / bash)

Local setup (Windows example)

1) Backend (Django)

Open PowerShell and run:

```powershell
cd backend_django
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
```

The API will be available at `http://127.0.0.1:8000/` by default.

2) Frontend (Vite + React)

Open a separate terminal and run:

```powershell
cd article-frontend
npm install
npm run dev
```

Vite will print the local dev URL (usually `http://localhost:5173`). The frontend talks to the Django API (configure the API base URL in `src/main.jsx` or the app config).

3) Scraper / Importer

To run the scraper locally:

```powershell
cd scraper-python
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scraper.py
# or run the import script:
python import_articles.py
```

Notes

- The development backend uses SQLite by default (file: `backend_django/db.sqlite3`).
- If you need environment-specific settings, create a `.env` or set OS environment variables before running the backend.

Running tests

Run Django tests from the repository root or inside `backend_django`:

```powershell
cd backend_django
venv\Scripts\Activate.ps1
python manage.py test
```

Project layout quick reference

- `backend_django/` — Django project, API, models, admin, migrations
- `article-frontend/` — React components, Vite config
- `scraper-python/` — scraping and import scripts
- `articles/enhancer/` — JS enhancer/publisher/scraper helpers

Architecture / Data Flow (quick diagram)

Below is a simple data-flow / architecture diagram (Mermaid). Many Markdown viewers (and GitHub) support Mermaid; if your viewer does not, the plain text explanation below describes the same flow.

```mermaid
graph LR
	User[User (Browser)] -->|HTTP| FE[Frontend (Vite + React)]
	FE -->|REST API calls| API[Backend (Django REST)]
	API -->|reads/writes| DB[SQLite DB]
	Scraper[Scraper (Python)] -->|POST / import| API
	Scraper -->|direct write| DB
	Enhancer[Enhancer / Publisher (Node)] -->|publishes| API
	API -->|search index calls| Search[Search/Index (enhancer/search.js)]
	FE -->|fetch| Search
```

Plain explanation:

- Users interact with the `article-frontend` which calls the Django API for data.
- The Django backend stores articles and metadata in the local SQLite DB and exposes endpoints for listing, detail, and admin operations.
- The `scraper-python` scripts fetch content externally and either POST to the API or write directly into the DB via import scripts.
- The `articles/enhancer` JS can post-process or publish enriched content and provide search/indexing helpers used by the frontend.

Where to look (important files)

- Backend entry & settings: `backend_django/manage.py`, `backend_django/backend_django/settings.py`
- Frontend entry: `article-frontend/src/main.jsx`, components in `article-frontend/src/components/`
- Scraper scripts: `scraper-python/scraper.py`, `scraper-python/import_articles.py`
- Enhancer code: `articles/enhancer/src/`

Quick troubleshooting

- If the frontend can't reach the API, verify the API URL and CORS settings in `backend_django` settings.
- If migrations fail, delete `db.sqlite3` (dev only) and rerun `python manage.py migrate`.

Deploying to Vercel (Frontend)

The `article-frontend` can be deployed to Vercel. Follow these steps:

1. **Connect your repository** to Vercel and select the `article-frontend` folder as the root.
2. **Set Environment Variables** in Vercel dashboard (Settings → Environment Variables):

| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://your-django-backend.com` | URL to your deployed Django backend (e.g., Heroku, AWS, Railway, etc.) |
| `VITE_API_BASE_PATH` | `/api` | (Optional) API base path if your Django is served under `/api` |

3. **Vercel Build Settings**:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Update frontend API calls** to use the environment variable. In `article-frontend/src/main.jsx` or your config, reference `import.meta.env.VITE_API_URL`.

Example in your React component:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const response = await fetch(`${API_URL}/api/articles/`);
```

Backend Deployment Notes

The Django backend can be deployed to:
- Heroku (free tier deprecated; use Heroku paid or alternatives)
- Railway.app (recommended; supports SQLite or PostgreSQL)
- PythonAnywhere
- AWS EC2 / Lightsail
- DigitalOcean App Platform
- Render.com

Key environment variables for production Django:
- `SECRET_KEY` — a strong, random secret key (generate one if not set)
- `DEBUG=False` — disable debug mode in production
- `ALLOWED_HOSTS` — add your domain(s)
- `DATABASE_URL` — if using PostgreSQL/MySQL instead of SQLite
- `CORS_ALLOWED_ORIGINS` — add your Vercel frontend URL

Example `.env` for production (do NOT commit this):
```
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

Next steps / Improvements

- Add a small PNG/SVG diagram under `docs/` and reference it here for viewers that don't support Mermaid.
- Add a `.env.example` template with all recommended env vars for local and production use.

If you'd like, I can also add a rendered image of the architecture diagram in `docs/` and update this README to include it.
