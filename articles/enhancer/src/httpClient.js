const axios = require('axios');
const { REQUEST_TIMEOUT_MS, API_KEY } = require('./config');

const instance = axios.create({
  timeout: REQUEST_TIMEOUT_MS,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9',
    'Referer': 'https://www.google.com/'
  }
});

if (API_KEY) {
  instance.defaults.headers.common['Authorization'] = `Bearer ${API_KEY}`;
}

module.exports = instance;
