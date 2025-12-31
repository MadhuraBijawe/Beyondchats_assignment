const fetch = globalThis.fetch || require('node-fetch');
const { SERPAPI_KEY, GOOGLE_CSE_KEY, GOOGLE_CSE_CX } = require('./config');

async function searchBySerpapi(q) {
  const url = `https://serpapi.com/search.json?q=${encodeURIComponent(q)}&api_key=${SERPAPI_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SerpAPI error: ${res.status}`);
  const data = await res.json();
  return (data.organic_results || []).map(r => ({
    title: r.title,
    link: r.link || r.url,
    snippet: r.snippet || r.excerpt || ''
  }));
}

async function searchByGoogleCSE(q) {
  const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_CSE_KEY}&cx=${GOOGLE_CSE_CX}&q=${encodeURIComponent(q)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`CSE error: ${res.status}`);
  const data = await res.json();
  return (data.items || []).map(i => ({
    title: i.title,
    link: i.link,
    snippet: i.snippet || ''
  }));
}

async function search(q) {
  if (SERPAPI_KEY) {
    try {
      return await searchBySerpapi(q);
    } catch (e) {
      console.warn('SerpAPI search failed, falling back to CSE', e.message);
    }
  }
  if (GOOGLE_CSE_KEY && GOOGLE_CSE_CX) {
    return await searchByGoogleCSE(q);
  }
  throw new Error('No search provider configured (SERPAPI_KEY or GOOGLE_CSE_KEY+GOOGLE_CSE_CX required)');
}

module.exports = { search };
