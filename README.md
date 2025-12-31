# 🚀 BeyondChats Project

## 📌 Overview

BeyondChats is a small multi-part project used to **collect, enhance, and serve articles**. It includes:

- ⚙️ **Django backend** (API + admin) in the `backend_django` folder
- 🎨 **Vite + React frontend** in the `article-frontend` folder
- 🕷️ **Python scraper & importer** in the `scraper-python` folder
- ✨ **JS-based enhancer / publisher** under `articles/enhancer`

---

## 🧰 Requirements

- 🐍 Python **3.10+** (Django backend & scraper)
- 🟢 Node.js **16+** and `npm` or `yarn` (frontend & enhancer)
- 🧑‍💻 Git and a terminal (PowerShell / bash)

---

## 🛠️ Local Setup (Windows Example)

### 1️⃣ Backend (Django)

Open **PowerShell** and run:

```powershell
cd backend_django
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000


📡 The API will be available at:
http://127.0.0.1:8000/

2️⃣ Frontend (Vite + React)

Open a separate terminal and run:

cd article-frontend
npm install
npm run dev


🌐 Vite will print the local dev URL (usually http://localhost:5173).
The frontend communicates with the Django API (configure the API base URL in src/main.jsx or app config).

3️⃣ Scraper / Importer

To run the scraper locally:

cd scraper-python
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python scraper.py
# or run the import script:
python import_articles.py

📝 Notes

🗄️ Development backend uses SQLite by default
(backend_django/db.sqlite3)

🌍 For environment-specific settings, create a .env file or set OS environment variables

🧪 Running Tests

Run Django tests from the repository root or inside backend_django:

cd backend_django
venv\Scripts\Activate.ps1
python manage.py test

🗂️ Project Layout – Quick Reference

⚙️ backend_django/ — Django project, API, models, admin, migrations

🎨 article-frontend/ — React components, Vite config

🕷️ scraper-python/ — Scraping and import scripts

✨ articles/enhancer/ — JS enhancer / publisher / search helpers

🧩 Architecture / Data Flow

The following diagram shows how data flows through the entire system.

graph LR
    User[👤 User (Browser)] -->|🌐 HTTP| FE[🎨 Frontend (Vite + React)]
    FE -->|🔁 REST API Calls| API[⚙️ Backend (Django REST)]
    API -->|💾 Read / Write| DB[🗄️ SQLite DB]
    Scraper[🕷️ Scraper (Python)] -->|📤 POST / Import| API
    Scraper -->|📝 Direct Write| DB
    Enhancer[✨ Enhancer / Publisher (Node)] -->|🚀 Publish| API
    API -->|🔍 Search Index Calls| Search[📚 Search / Index (enhancer/search.js)]
    FE -->|🔎 Fetch| Search

🧠 Plain Explanation

👤 Users interact with the React frontend

🎨 Frontend fetches article data from the Django API

⚙️ Django backend:

Stores articles & metadata

Exposes REST APIs

Provides admin operations

🗄️ SQLite database stores all persistent data

🕷️ Python scraper:

Collects articles from external sources

Sends data via API or writes directly to DB

✨ JS enhancer:

Enhances and publishes content

Manages search and indexing helpers

📚 Frontend uses search helpers for fast article lookup

📍 Where to Look (Important Files)

⚙️ Backend entry & settings:
backend_django/manage.py
backend_django/backend_django/settings.py

🎨 Frontend entry:
article-frontend/src/main.jsx
article-frontend/src/components/

🕷️ Scraper scripts:
scraper-python/scraper.py
scraper-python/import_articles.py

✨ Enhancer code:
articles/enhancer/src/

🚑 Quick Troubleshooting

❌ Frontend can’t reach the API
→ Check API base URL and CORS settings in Django

❌ Migration issues (dev only)
→ Delete db.sqlite3 and run:

python manage.py migrate
