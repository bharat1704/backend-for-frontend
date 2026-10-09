const express = require('express');
const cors = require('cors');
const path = require('path');
const mobileRouter = require('./routes/mobile');
const webRouter = require('./routes/web');
const { fetchUser, fetchOrders, fetchRecommendations } = require('./adapters/microservices');

const app = express();
const PORT = process.env.BFF_PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve static frontend interactive demo dashboard
app.use(express.static(path.join(__dirname, '..', 'public')));

// Mount Client-specific BFF routes
app.use('/api/mobile', mobileRouter);
app.use('/api/web', webRouter);

// Comparison & Analytics Endpoint: Shows the real architectural difference!
app.get('/api/compare/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    // 1. Direct Microservices Simulation
    const t0 = Date.now();
    const rawUser = await fetchUser(userId);
    const rawOrders = await fetchOrders(userId);
    const rawProducts = await fetchRecommendations(userId);
    const directFetchTime = Date.now() - t0;

    const directCombined = { rawUser, rawOrders, rawProducts };
    const directSizeBytes = Buffer.byteLength(JSON.stringify(directCombined), 'utf8');

    // 2. Mobile BFF Call Simulation
    const mobileRes = await fetch(`http://localhost:${PORT}/api/mobile/dashboard/${userId}`);
    const mobileJson = await mobileRes.json();
    const mobileSizeBytes = Buffer.byteLength(JSON.stringify(mobileJson), 'utf8');

    // 3. Web BFF Call Simulation
    const webRes = await fetch(`http://localhost:${PORT}/api/web/dashboard/${userId}`);
    const webJson = await webRes.json();
    const webSizeBytes = Buffer.byteLength(JSON.stringify(webJson), 'utf8');

    res.json({
      comparison: {
        directCalls: {
          roundtripsFromClient: 3,
          payloadSizeBytes: directSizeBytes,
          sizeFormatted: `${(directSizeBytes / 1024).toFixed(2)} KB`,
          securityRisk: 'HIGH (Exposes hashedPassword, internal audit IDs, supplier costs)',
          clientEffort: 'HIGH (Client must filter, sort, join, and format fields)',
          sampleData: directCombined
        },
        mobileBff: {
          roundtripsFromClient: 1,
          payloadSizeBytes: mobileSizeBytes,
          sizeFormatted: `${(mobileSizeBytes / 1024).toFixed(2)} KB`,
          bandwidthSavedPercent: `${(((directSizeBytes - mobileSizeBytes) / directSizeBytes) * 100).toFixed(1)}%`,
          securityRisk: 'NONE (Sanitized on BFF)',
          clientEffort: 'MINIMAL (Directly maps to mobile cards and widgets)',
          sampleData: mobileJson
        },
        webBff: {
          roundtripsFromClient: 1,
          payloadSizeBytes: webSizeBytes,
          sizeFormatted: `${(webSizeBytes / 1024).toFixed(2)} KB`,
          securityRisk: 'NONE (Sanitized on BFF)',
          clientEffort: 'MINIMAL (Directly maps to web tables, carousels, and grids)',
          sampleData: webJson
        }
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'bff-gateway', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[BFF Server] Running on http://localhost:${PORT}`);
    console.log(`👉 Open http://localhost:${PORT} in your browser to view the interactive demo!`);
  });
}

module.exports = app;
