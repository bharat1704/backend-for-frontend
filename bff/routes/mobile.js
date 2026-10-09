const express = require('express');
const router = express.Router();
const { fetchUser, fetchOrders, fetchRecommendations } = require('../adapters/microservices');

/**
 * Mobile App Dashboard Endpoint: GET /api/mobile/dashboard/:userId
 * 
 * WHY A MOBILE BFF?
 * 1. Bandwidth Efficiency: Only returns fields the mobile screen actually renders.
 * 2. Network Latency: Fetches 3 microservices concurrently in the backend data center (<5ms)
 *    and sends 1 consolidated JSON response back to the device over 4G/5G.
 * 3. Client Simplicity: Pre-formats strings, prices, and status indicators so the mobile UI
 *    doesn't have to execute complex data transformation or business logic on device.
 * 4. Data Privacy & Security: Omits sensitive fields (passwords, audit IDs, internal profit margins).
 */
router.get('/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  const startTime = Date.now();

  try {
    // BFF aggregates data from 3 separate microservices in parallel
    const [rawUser, rawOrders, rawProducts] = await Promise.all([
      fetchUser(userId),
      fetchOrders(userId),
      fetchRecommendations(userId)
    ]);

    if (!rawUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Transform User Profile for Mobile Header
    const userSummary = {
      displayName: `${rawUser.firstName} ${rawUser.lastName}`,
      greeting: `Welcome back, ${rawUser.firstName}!`,
      badge: rawUser.role === 'premium_member' ? '⭐ Premium Member' : 'Member',
      preferredTheme: rawUser.preferences?.theme || 'light'
    };

    // 2. Transform Orders: Mobile only shows the most urgent active order at the top
    const activeOrderRaw = rawOrders.find((o) => o.status === 'OUT_FOR_DELIVERY') || rawOrders[0];
    let activeOrderCard = null;

    if (activeOrderRaw) {
      const isDelivered = activeOrderRaw.status === 'DELIVERED';
      activeOrderCard = {
        orderId: activeOrderRaw.orderId,
        statusText: isDelivered ? 'Delivered' : '🚚 Out for Delivery',
        statusColor: isDelivered ? '#10b981' : '#3b82f6',
        itemsCount: `${activeOrderRaw.items.length} item${activeOrderRaw.items.length > 1 ? 's' : ''}`,
        totalFormatted: `$${activeOrderRaw.totalAmount.toFixed(2)}`,
        quickTracking: activeOrderRaw.trackingNumber
      };
    }

    // 3. Transform Recommendations: Mobile only needs top 2 items, small thumbnail, formatted price
    const topRecommendations = rawProducts.slice(0, 2).map((p) => ({
      id: p.productId,
      title: p.name,
      priceFormatted: `$${p.price.toFixed(2)}`,
      ratingText: `★ ${p.rating}`,
      thumbnail: p.thumbnail
    }));

    // Mobile-optimized payload (compact, clean, ready-to-render)
    const mobilePayload = {
      client: 'mobile-app',
      user: userSummary,
      activeOrder: activeOrderCard,
      quickPicks: topRecommendations,
      bffMetadata: {
        roundtripsFromClient: 1,
        internalServicesQueried: ['users', 'orders', 'products'],
        processedInMs: Date.now() - startTime
      }
    };

    res.json(mobilePayload);
  } catch (error) {
    console.error('[Mobile BFF Error]', error);
    res.status(500).json({ error: 'Internal Server Error in Mobile BFF' });
  }
});

module.exports = router;
