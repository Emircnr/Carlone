// server.js - Paribu API Proxy - MAKSIMUM HIZ ⚡
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const http = require('http');
const https = require('https');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ===== INDEX.HTML SERVIS ET (CORS sorunu çözümü!) =====
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'), (err) => {
    if (err) {
      res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Hata - Paribu Proxy</title></head>
        <body style="font-family:system-ui;padding:40px;background:#0b1220;color:#e6edf6">
          <h1 style="color:#ef4444">❌ index.html bulunamadı!</h1>
          <p style="color:#9fb0ca">index.html dosyasını server.js ile aynı klasöre koy.</p>
          <p style="color:#9fb0ca">Sonra tarayıcıyı yenile: <code>http://localhost:3000</code></p>
          <hr style="border-color:#17243e;margin:30px 0">
          <h2 style="color:#60a5fa">API Endpoints:</h2>
          <ul style="color:#9fb0ca">
            <li>POST /api/paribu/batch</li>
            <li>GET  /api/paribu/orderbook?market=btc_tl</li>
            <li>GET  /health</li>
          </ul>
        </body>
        </html>
      `);
    }
  });
});

// ===== CACHE (200ms) =====
const cache = new Map();
const CACHE_TTL = 200;

function getCacheKey(market) { return `orderbook:${market}`; }

function getFromCache(key) {
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return item.data;
}

function setCache(key, data) {
  cache.set(key, { data, timestamp: Date.now() });
}

setInterval(() => {
  const now = Date.now();
  for (const [key, item] of cache.entries()) {
    if (now - item.timestamp > CACHE_TTL) cache.delete(key);
  }
}, 2000);

// ===== AXIOS (1s timeout) =====
const apiClient = axios.create({
  timeout: 1000,
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json',
  },
  maxRedirects: 3,
  httpAgent: new http.Agent({ keepAlive: true, maxSockets: 200, timeout: 1000 }),
  httpsAgent: new https.Agent({ keepAlive: true, maxSockets: 200, timeout: 1000 }),
});

// ===== TEK COIN =====
app.get('/api/paribu/orderbook', async (req, res) => {
  const { market } = req.query;
  if (!market) return res.status(400).json({ error: 'market gerekli' });

  try {
    const cacheKey = getCacheKey(market);
    const cached = getFromCache(cacheKey);
    if (cached) return res.json(cached);

    const response = await apiClient.get(`https://api.paribu.com/orderbook?market=${market}`);
    setCache(cacheKey, response.data);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'API hatası', market, details: error.message });
  }
});

// ===== BATCH API =====
app.post('/api/paribu/batch', async (req, res) => {
  const { markets } = req.body;
  if (!Array.isArray(markets) || markets.length === 0) {
    return res.status(400).json({ error: 'markets array gerekli' });
  }

  try {
    const startTime = Date.now();
    
    const promises = markets.map(async (market) => {
      try {
        const cacheKey = getCacheKey(market);
        const cached = getFromCache(cacheKey);
        if (cached) return { market, success: true, data: cached, cached: true };

        const response = await apiClient.get(`https://api.paribu.com/orderbook?market=${market}`);
        setCache(cacheKey, response.data);
        return { market, success: true, data: response.data, cached: false };
      } catch (error) {
        return { market, success: false, error: error.message };
      }
    });

    const results = await Promise.all(promises);
    const duration = Date.now() - startTime;
    const successCount = results.filter(r => r.success).length;
    const cachedCount = results.filter(r => r.cached).length;
    
    res.json({
      success: true,
      duration,
      total: markets.length,
      successful: successCount,
      cached: cachedCount,
      results
    });
  } catch (error) {
    res.status(500).json({ error: 'Batch hata', details: error.message });
  }
});

// ===== HEALTH =====
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    server: 'Paribu Proxy - MAKSIMUM HIZ',
    cache: { size: cache.size, ttl: CACHE_TTL + 'ms' },
    performance: { timeout: '1000ms', connections: 200 }
  });
});

// ===== 404 =====
app.use((req, res) => res.status(404).json({ error: 'Endpoint yok' }));

// ===== START =====
app.listen(PORT, () => {
  console.log('\n⚡ MAKSIMUM HIZ - http://localhost:' + PORT);
  console.log('🚀 Cache: 200ms | Timeout: 1s | Connections: 200');
  console.log('⚡ Concurrent Limit: 15 (Binance)');
  console.log('📄 index.html: http://localhost:' + PORT + '/\n');
});

process.on('SIGINT', () => { console.log('\n🛑 Kapatılıyor...'); process.exit(0); });
