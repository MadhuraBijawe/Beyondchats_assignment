import React, { useState } from 'react'
import ReactMarkdown from 'react-markdown'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

function Preview({ content }) {
  // Use ReactMarkdown for safe rendering
  return (
    <div className="preview">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  )
}

export default function ArticleCard({ article }) {
  const [enhancing, setEnhancing] = useState(false)
  const updatedHtml = article.updated_content || article.updated_version || ''

  return (
    <article className="card">
      <h2 className="title">{article.title}</h2>
      <div className="meta">ID: {article.id}</div>
      <div style={{ margin: '0.5rem 0' }}>
        <button
          className="btn"
          onClick={async () => {
            try {
              setEnhancing(true)
              await fetch(`${API_BASE.replace(/\/$/, '')}/articles/${article.id}/enhance/`, { method: 'POST' })
            } finally {
              setEnhancing(false)
            }
          }}
          disabled={enhancing}
        >{enhancing ? 'Enhancing…' : 'Enhance'}</button>
      </div>
      <div className="cols">
        <section>
          <h3>Original</h3>
          {article.content ? <Preview content={article.content} /> : <div className="muted">No original content</div>}
        </section>
        <section>
          <h3>Updated</h3>
          {updatedHtml ? (
            <Preview content={updatedHtml} />
          ) : (
            <div className="muted">No updated content</div>
          )}
        </section>
      </div>
    </article>
  )
}
