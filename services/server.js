const express = require('express');
const cors = require('cors');
const { users, orders, products } = require('./mockData');

const app = express();
const PORT = process.env.SERVICES_PORT || 4000;

app.use(cors());
app.use(express.json());

// Simulated network delay helper to mimic real-world database / internal service response times
const delay = (ms = 40) => new Promise((resolve) => setTimeout(resolve, ms));

// 1. User Microservice
// In real life, maintained by the Identity & Account team
app.get('/services/users/:id', async (req, res) => {
  await delay();
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Raw microservice response: contains everything, including sensitive & internal audit data
  res.json({
    service: 'user-service',
    timestamp: new Date().toISOString(),
    data: user
  });
});

// 2. Order Microservice
// In real life, maintained by the Checkout & Fulfillment team
app.get('/services/orders', async (req, res) => {
  await delay();
  const { userId } = req.query;
  const userOrders = orders.filter((o) => !userId || o.userId === userId);

  // Raw microservice response: heavy, with warehouse logistics, internal tax formulas, etc.
  res.json({
    service: 'order-service',
    timestamp: new Date().toISOString(),
    count: userOrders.length,
    data: userOrders
  });
});

// 3. Recommendation / Product Catalog Microservice
// In real life, maintained by the Data Science & Catalog team
app.get('/services/products/recommended', async (req, res) => {
  await delay();
  // Returns personalized recommendations with internal ML scores and supplier margins
  res.json({
    service: 'recommendation-service',
    timestamp: new Date().toISOString(),
    model: 'recsys-transformer-v3',
    data: products
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'core-microservices', port: PORT });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`[Microservices Backend] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
