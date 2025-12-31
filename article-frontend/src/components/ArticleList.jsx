import React, { useEffect, useState } from 'react'
import axios from 'axios'
import ArticleCard from './ArticleCard'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

export default function ArticleList() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchArticles() {
    setLoading(true)
    setError(null)
    try {
      const res = await axios.get(`${API_BASE.replace(/\/$/, '')}/articles/`)
      setArticles(res.data || [])
    } catch (e) {
      setError(e.message || 'Failed to fetch')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [])

  return (
    <section className="container">
      <div className="controls">
        <button onClick={fetchArticles} disabled={loading} className="btn">Refresh</button>
        {loading && <span className="muted"> Loading…</span>}
      </div>
      {error && <div className="error">Error: {error}</div>}
      <div className="grid">
        {articles.length === 0 && !loading && <div className="muted">No articles found.</div>}
        {articles.map(a => (
          <ArticleCard key={a.id} article={a} />
        ))}
      </div>
    </section>
  )
}
