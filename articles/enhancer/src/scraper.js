const cheerio = require('cheerio');
const http = require('./httpClient');

function cleanupText(s) {
  return s.replace(/\s+/g, ' ').trim();
}

async function scrapeMainContent(url) {
  // Try a few times because some endpoints intermittently block or rate-limit
  let lastErr = null;
  let html = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await http.get(url, { responseType: 'text' });
      html = res.data;
      break;
    } catch (e) {
      lastErr = e;
      const code = e.response && e.response.status;
      // If site explicitly blocks (403) or other non-retriable codes like 999, break early
      if (code === 403 || code === 401 || code === 429 || code === 999) {
        console.warn('Scrape blocked', { url, status: code, attempt });
        break;
      }
      // small backoff
      await new Promise(r => setTimeout(r, attempt * 500));
    }
  }
  if (!html) {
    const errMsg = lastErr ? (lastErr.message || (lastErr.response && JSON.stringify(lastErr.response.data))) : 'no-response';
    throw new Error(`Failed to fetch ${url}: ${errMsg}`);
  }
  const $ = cheerio.load(html);

  const selectors = ['article', 'main', '[role=main]', '.post-content', '.article-content', '.entry-content'];
  let content = '';
  for (const sel of selectors) {
    const el = $(sel).first();
    if (el && el.text() && el.text().length > 200) {
      content = el.text();
      break;
    }
  }

  if (!content) {
    let best = '';
    $('p').each((i, p) => {
      const t = $(p).text();
      if (t.length > best.length) best = t;
    });
    content = best || $('body').text();
  }

  content = cleanupText(content || '');

  const headings = [];
  $('h1,h2,h3').each((i, h) => headings.push($(h).text().trim()));

  return {
    url,
    title: cleanupText($('title').text() || headings[0] || ''),
    headings,
    content
  };
}

module.exports = { scrapeMainContent };
