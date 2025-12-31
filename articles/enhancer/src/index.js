const http = require('./httpClient');
const { search } = require('./search');
const { scrapeMainContent } = require('./scraper');
const { rewriteArticle } = require('./llm');
const { publishUpdatedArticle } = require('./publisher');
const { API_BASE_URL } = require('./config');

const DRY_RUN = process.env.DRY_RUN === '1' || process.env.DRY_RUN === 'true';

function tokenize(s) {
  return (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function jaccard(a, b) {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  const inter = new Set([...A].filter(x => B.has(x))).size;
  const uni = new Set([...A, ...B]).size || 1;
  return inter / uni;
}

async function main() {
  console.log('Fetching articles...');
  let articles = [];
  try {
    // Request explicit JSON to avoid DRF returning the browsable HTML page
    const res = await http.get(`${API_BASE_URL.replace(/\/$/, '')}/articles/`, { headers: { Accept: 'application/json' } });
    articles = res.data;
    if (!Array.isArray(articles)) {
      // Accept common API shapes: { results: [...] } (paginated), { data: [...] }, { articles: [...] }
      if (articles && Array.isArray(articles.results)) {
        articles = articles.results;
      } else if (articles && Array.isArray(articles.data)) {
        articles = articles.data;
      } else if (articles && Array.isArray(articles.articles)) {
        articles = articles.articles;
      } else {
        console.error('Expected articles array from API', { body: res.data });
        articles = [];
      }
    }
  } catch (e) {
    console.warn('Could not fetch articles from API, using a local sample for dry-run:', e.code || e.message);
    articles = [
      { id: 'dryrun-1', title: 'How to test sample article', content: 'This is a sample article content used for a dry-run test. It contains several paragraphs and headings.' }
    ];
  }

  for (const article of articles) {
    try {
      console.log(`Processing article id=${article.id} title="${article.title}"`);
      const results = await search(article.title);
      const top = results.slice(0, 6).filter(r => r.link).slice(0, 2);
      const refs = [];
      for (const r of top) {
        try {
          const scraped = await scrapeMainContent(r.link);
          refs.push(scraped);
        } catch (e) {
          console.warn('Scrape failed for', r.link, e.message);
        }
      }

      const similarities = refs.map(r => jaccard(r.content, article.content || ''));
      console.log('Similarities to top refs:', similarities.map(s => s.toFixed(2)).join(', '));

      const refSection = '\n\nReferences:\n' + refs.map(r => r.url).join('\n');

      // Heuristic: skip expensive LLM call when references are absent or similarity is very low
      const avgSim = similarities.length ? (similarities.reduce((a, b) => a + b, 0) / similarities.length) : 0;
      let finalContent;
      // ALWAYS rewrite to ensure consistent formatting (H1 Heading, Markdown)
      // even if no references are found.
      const rewritten = await rewriteArticle({ original: article.content || article.body || '', references: refs, title: article.title });
      finalContent = rewritten.endsWith(refSection) ? rewritten : rewritten + refSection;

      // Update 'updated_version' to preserve original 'content'
      const payload = { updated_version: finalContent };

      if (DRY_RUN) {
        console.log('DRY_RUN enabled — skipping publish. Payload preview:');
        console.log(JSON.stringify(payload).slice(0, 1000));
      } else {
        const published = await publishUpdatedArticle(article.id, payload);
        console.log('Published article id=', article.id, 'response=', published && published.id ? 'ok' : 'unknown');
      }
    } catch (e) {
      console.error('Error processing article', article.id, e.message);
    }
  }
}

main().catch(err => {
  console.error('Fatal error', err);
  process.exit(1);
});
