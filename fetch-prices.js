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
// DEMO key → always use public host; do not send Pro header
const PUBLIC_HOST = 'api.coingecko.com';
const initialHost = PUBLIC_HOST;
// Encode each id, not the comma separators
const idsParam = coins.map((id) => encodeURIComponent(id)).join(',');
const path = `/api/v3/simple/price?ids=${idsParam}&vs_currencies=usd`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryAfterMs(headers) {
  if (!headers) return 0;
  const retryAfter = headers['retry-after'];
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) {
      return Math.max(0, seconds * 1000);
    }
    const dateMs = Date.parse(retryAfter);
    if (!Number.isNaN(dateMs)) {
      const delta = dateMs - Date.now();
      return Math.max(0, delta);
    }
  }
  const resetEpoch =
    Number(headers['x-ratelimit-reset']) ||
    Number(headers['ratelimit-reset']) ||
    Number(headers['x-rl-reset']);
  if (!Number.isNaN(resetEpoch) && resetEpoch > 0) {
    const resetMs = resetEpoch * 1000;
    const delta = resetMs - Date.now();
    return Math.max(0, delta);
  }
  return 0;
}

async function fetchWithRetries(maxRetries = 6, initialDelayMs = 1000, hostForRequest = initialHost) {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    attempt += 1;
    try {
      const result = await doRequest(hostForRequest);
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

      // With demo key/public host, just backoff on 429/5xx.

      if (!retriable || attempt > maxRetries) {
        throw err;
      }

      if (status === 429) {
        const waitMs = Math.max(delay, parseRetryAfterMs(err.headers)) + Math.floor(Math.random() * 500);
        await sleep(waitMs);
        delay = Math.min(Math.max(delay * 2, 1000), 60000);
        continue;
      }

      const jitter = Math.floor(Math.random() * 250);
      await sleep(delay + jitter);
      delay = Math.min(delay * 2, 16000);
    }
  }
}

function doRequest(hostname) {
  const headers = {
    'User-Agent': 'diego40-price-fetcher/1.0 (+github-actions)',
    'Accept': 'application/json',
  };
  // No Pro header for demo key/public host

  const options = {
    hostname: hostname,
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
          error.headers = res.headers || {};
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

// No host switching helpers needed for demo key

(async function main() {
  try {
    // Add a short random pre-sleep (5–20s) to avoid shared-IP spikes on public host
    const preSleepMs = 5000 + Math.floor(Math.random() * 15000);
    await sleep(preSleepMs);
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

