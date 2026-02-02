/* Fetch current USD prices for configured CoinGecko ids and write prices.json
   - Supports CoinGecko API key via env COINGECKO_API_KEY (recommended; required for 403s)
   - Retries on 429 and transient 5xx with exponential backoff
*/
const https = require('https');
const fs = require('fs');

const coins = [
  'official-trump',
  'melania-meme',
  'fartcoin',
  'banana-for-scale-2',
  'cumrocket',
  'unicorn-fart-dust',
];

const apiKey = process.env.COINGECKO_API_KEY || '';
// Use Pro host when an API key is provided to avoid public API restrictions
const host = apiKey ? 'pro-api.coingecko.com' : 'api.coingecko.com';
// Encode each id, not the comma separators
const idsParam = coins.map((id) => encodeURIComponent(id)).join(',');
const path = `/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetries(maxRetries = 4, initialDelayMs = 1000) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    attempt += 1;
    try {
      const result = await doRequest();
      return result;
    } catch (err) {
      const status = err && err.statusCode ? err.statusCode : 0;
      const retriable = status === 429 || (status >= 500 && status < 600) || err.code === 'ECONNRESET';

      if (status === 403) {
        const missingKey = !apiKey;
        const message = missingKey
          ? '403 Forbidden from CoinGecko. An API key is now required. Set COINGECKO_API_KEY.'
          : '403 Forbidden from CoinGecko despite API key. Verify key validity and plan limits.';
        throw new Error(message);
      }

      if (!retriable || attempt > maxRetries) {
        throw err;
      }

      const jitter = Math.floor(Math.random() * 250);
      await sleep(delay + jitter);
      delay = Math.min(delay * 2, 16000);
    }
  }
}

function doRequest() {
  const headers = {
    'User-Agent': 'diego40-price-fetcher/1.0 (+github-actions)',
    'Accept': 'application/json',
  };
  if (apiKey) {
    headers['x-cg-pro-api-key'] = apiKey;
  }

  const options = {
    hostname: host,
    path,
    method: 'GET',
    headers,
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';

      res.on('data', (chunk) => {
        body += chunk;
      });

      res.on('end', () => {
        if (res.statusCode !== 200) {
          const error = new Error(`HTTP error! status: ${res.statusCode}`);
          error.statusCode = res.statusCode;
          // Attach response body for diagnostics when possible
          try {
            error.response = JSON.parse(body);
          } catch {
            error.response = body;
          }
          return reject(error);
        }

        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          reject(new Error(`Error parsing response JSON: ${e.message}`));
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.end();
  });
}

(async function main() {
  try {
    const prices = await fetchWithRetries();
    prices.lastUpdate = new Date().toISOString();
    fs.writeFileSync('prices.json', JSON.stringify(prices, null, 2));
    console.log('Prices updated successfully.');
  } catch (e) {
    console.error(e.message || e);
    if (e.response) {
      console.error('Response:', typeof e.response === 'string' ? e.response : JSON.stringify(e.response));
    }
    process.exit(1);
  }
})();

