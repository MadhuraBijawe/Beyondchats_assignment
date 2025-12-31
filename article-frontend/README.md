# Article Frontend (Vite + React)

Minimal React frontend to view original articles and their updated versions from the API.

Setup

1. Copy `.env.example` to `.env` and update `VITE_API_BASE_URL` if different.
2. Install dependencies:

```bash
cd article-frontend
npm install
```

Run (development):

```bash
npm run dev
```

What it does

- Fetches `GET /articles/` from `VITE_API_BASE_URL` and displays each article.
- Shows original `content` and expects updated content under `updated_content` field (adjust if your API uses a different name).

Notes

- If your backend requires authentication, update `src/components/ArticleList.jsx` to include auth headers on the axios request.
- The UI is intentionally minimal and responsive; extend components as needed.
