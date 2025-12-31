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
