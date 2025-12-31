import React from 'react'
import ArticleList from './components/ArticleList'

export default function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Articles — Original & Updated</h1>
      </header>
      <main>
        <ArticleList />
      </main>
      <footer className="footer">Article Frontend — Minimal Vite + React UI</footer>
    </div>
  )
}
