const fetch = globalThis.fetch || require('node-fetch');
const { GEMINI_API_KEY, GEMINI_API_URL } = require('./config');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

function safeExtractTextFromResponse(data) {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (data.output_text) return data.output_text;
  if (data.output && typeof data.output === 'string') return data.output;
  if (data.choices && Array.isArray(data.choices) && data.choices[0] && data.choices[0].message && data.choices[0].message.content)
    return data.choices[0].message.content;
  if (data.text) return data.text;
  if (Array.isArray(data.candidates) && data.candidates[0] && data.candidates[0].content) {
    if (data.candidates[0].content.parts && data.candidates[0].content.parts[0] && data.candidates[0].content.parts[0].text) {
      return data.candidates[0].content.parts[0].text;
    }
    return data.candidates[0].content;
  }
  return JSON.stringify(data);
}

async function rewriteArticle({ original, references = [], title }) {
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    const refTxt = references.map(r => `${r.url}`).join('\n');
    return `${original}\n\nReferences:\n${refTxt}`;
  }
  // Trim long inputs
  const MAX_ORIGINAL_CHARS = 8000;
  const MAX_REF_EXCERPT = 600;
  const safeOriginal = (original || '').slice(0, MAX_ORIGINAL_CHARS);

  const shortRefs = references.slice(0, 2).map((r, i) =>
    `REF${i + 1}_URL: ${r.url}\nREF${i + 1}_EXCERPT: ${r.content ? r.content.slice(0, MAX_REF_EXCERPT) : ''}`
  ).join('\n\n');

  const prompt = `You are an expert editor. Rewrite and improve the article to match the structure, critical tone, and depth of the provided references while preserving key facts.
  \nIMPORTANT: Return ONLY the raw content in standard Markdown format. 
  1. Start with a clear, bold Level 1 Heading (# Title) that serves as the new title of the article.
  2. Use subheadings (##) for sections.
  3. Do NOT wrap the result in JSON. 
  4. Do NOT include a separate "references" array, just text.`;

  let openaiBase;
  try {
    const u = new URL(GEMINI_API_URL);
    if (GEMINI_API_URL.includes('/openai/')) {
      openaiBase = GEMINI_API_URL.replace(/\/$/, '');
    } else {
      openaiBase = `${u.protocol}//${u.host}/v1beta/openai`;
    }
  } catch (e) {
    openaiBase = GEMINI_API_URL;
  }

  const endpoint = `${openaiBase.replace(/\/$/, '')}/v1/chat/completions`;

  const messages = [
    { role: 'system', content: 'You are an expert editor. Output strictly in Markdown.' },
    { role: 'user', content: `${prompt}\n\nOriginal title:\n${title}\n\nOriginal article:\n${original}\n\nReference excerpts:\n${shortRefs}\n\nRespond ONLY with the Markdown body.` }
  ];

  const body = {
    model: GEMINI_MODEL,
    messages,
    max_tokens: 2000,
    temperature: 0.7
  };

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GEMINI_API_KEY}`
  };



  let res;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
  } catch (e) {
    console.error('LLM request network error:', e.message || e);
    const refsSection = '\n\nReferences:\n' + references.map(r => r.url).join('\n');
    // Fallback: Prepend Title as Heading level 1 to ensure consistency
    return `# ${title}\n\n${safeOriginal}` + refsSection;
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '<no-body>');
    console.error('LLM request failed', { status: res.status, body: text });
    const refsSection = '\n\nReferences:\n' + references.map(r => r.url).join('\n');
    // Fallback: Prepend Title as Heading level 1 to ensure consistency
    return `# ${title}\n\n${safeOriginal}` + refsSection;
  }

  const data = await res.json().catch(() => null);
  let text = safeExtractTextFromResponse(data);

  // Clean markdown fences if present
  text = text.replace(/^```markdown\s*/, '').replace(/^```\s*/, '').replace(/```$/, '');

  const refsSection = '\n\nReferences:\n' + references.map(r => r.url).join('\n');
  return text + refsSection;
}

module.exports = { rewriteArticle };
