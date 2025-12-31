const http = require('./httpClient');
const { API_BASE_URL } = require('./config');

async function publishUpdatedArticle(articleId, payload) {
  // Ensure trailing slashes so Django with APPEND_SLASH works correctly
  const base = API_BASE_URL.replace(/\/$/, '');
  const url = `${base}/articles/${articleId}/`;
  try {
    const res = await http.patch(url, payload);
    if (res.status >= 200 && res.status < 300) return res.data;
    console.warn('PUT returned non-2xx', { status: res.status, data: res.data });
    // fallthrough to POST fallback
  } catch (e) {
    console.error('PATCH to article failed', e.response?.status, e.response?.data || e.message || e);
  }
  try {
    const collUrl = `${base}/articles/`;
    const res2 = await http.post(collUrl, { id: articleId, ...payload });
    return res2.data;
  } catch (e2) {
    console.error('POST fallback failed', e2.response?.status, e2.response?.data || e2.message || e2);
    throw e2;
  }
}

module.exports = { publishUpdatedArticle };
