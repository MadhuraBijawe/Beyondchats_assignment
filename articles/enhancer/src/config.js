const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '..', '.env') });

const get = (k, d = undefined) => process.env[k] ?? d;

module.exports = {
  API_BASE_URL: get('API_BASE_URL', 'http://localhost:8000'),
  API_KEY: get('API_KEY'),
  SERPAPI_KEY: get('SERPAPI_KEY'),
  GOOGLE_CSE_KEY: get('GOOGLE_CSE_KEY'),
  GOOGLE_CSE_CX: get('GOOGLE_CSE_CX'),
  GEMINI_API_KEY: get('GEMINI_API_KEY'),
  GEMINI_API_URL: get('GEMINI_API_URL'),
  REQUEST_TIMEOUT_MS: Number(get('REQUEST_TIMEOUT_MS', '15000'))
};
