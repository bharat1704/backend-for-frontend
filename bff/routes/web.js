const express = require('express');
const router = express.Router();
const { fetchUser, fetchOrders, fetchRecommendations } = require('../adapters/microservices');

/**
 * Web App Dashboard Endpoint: GET /api/web/dashboard/:userId
 * 
 * WHY A WEB BFF?
 * 1. Rich Layout Data: Desktop displays large multi-column grids, detailed order tables,
 *    and multi-image carousels that mobile doesn't have screen space for.
 * 2. Breadth of Detail: Includes full billing addresses, warranty information, detailed specs,
 *    and order history with pagination metadata.
 * 3. Security Filtering: Strips out internal security IDs and supplier profit margins
 *    while preserving complete UI-relevant data for desktop components.
 */
router.get('/dashboard/:userId', async (req, res) => {
  const { userId } = req.params;
  const startTime = Date.now();

  try {
    const [rawUser, rawOrders, rawProducts] = await Promise.all([
      fetchUser(userId),
      fetchOrders(userId),
      fetchRecommendations(userId)
    ]);

    if (!rawUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // 1. Web Profile Section (detailed)
    const profile = {
      id: rawUser.id,
      fullName: `${rawUser.firstName} ${rawUser.lastName}`,
      email: rawUser.email,
      membership: {
        type: rawUser.role === 'premium_member' ? 'Platinum Premium' : 'Standard',
        expiresOn: new Date(rawUser.membershipExpiresAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        isAutoRenew: true
      },
      billingAddressFormatted: `${rawUser.billingAddress.street}, ${rawUser.billingAddress.city}, ${rawUser.billingAddress.state} - ${rawUser.billingAddress.zip}, ${rawUser.billingAddress.country}`,
      preferences: rawUser.preferences
    };

    // 2. Web Order History Table (full history with items and actions)
    const orderHistory = rawOrders.map((order) => {
      const dateFormatted = new Date(order.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });

      return {
        orderId: order.orderId,
        date: dateFormatted,
        status: {
          code: order.status,
          label: order.status.replace(/_/g, ' '),
          isFinal: order.status === 'DELIVERED'
        },
        courier: {
          partner: order.courierPartner,
          trackingNumber: order.trackingNumber,
          trackingUrl: `https://track.example.com/${order.trackingNumber}`
        },
        financials: {
          subtotalFormatted: `$${order.subtotal.toFixed(2)}`,
          taxFormatted: `$${order.taxCalculations.gstAmount.toFixed(2)}`,
          totalFormatted: `$${order.totalAmount.toFixed(2)}`
        },
        items: order.items.map((item) => ({
          sku: item.sku,
          title: item.title,
          quantity: item.quantity,
          unitPriceFormatted: `$${item.unitPrice.toFixed(2)}`,
          warranty: `${item.warrantyMonths} Months Warranty Included`
        })),
        invoiceDownloadUrl: `/api/invoices/download/${order.orderId}`
      };
    });

    // 3. Web Catalog Recommendations (rich grid with full specs, ratings, multiple images)
    const recommendationsGrid = rawProducts.map((prod) => ({
      productId: prod.productId,
      name: prod.name,
      category: prod.category,
      priceFormatted: `$${prod.price.toFixed(2)}`,
      inStock: prod.stockQuantity > 0,
      stockCount: prod.stockQuantity,
      rating: {
        stars: prod.rating,
        reviewCount: prod.reviewCount,
        summaryText: `${prod.rating} / 5 (${prod.reviewCount.toLocaleString()} verified reviews)`
      },
      images: prod.images,
      specsTable: prod.specs
    }));

    const webPayload = {
      client: 'web-desktop-app',
      userProfile: profile,
      recentOrders: orderHistory,
      recommendedProducts: recommendationsGrid,
      bffMetadata: {
        roundtripsFromClient: 1,
        totalOrdersCount: orderHistory.length,
        totalRecommendationsCount: recommendationsGrid.length,
        internalServicesQueried: ['users', 'orders', 'products'],
        processedInMs: Date.now() - startTime
      }
    };

    res.json(webPayload);
  } catch (error) {
    console.error('[Web BFF Error]', error);
    res.status(500).json({ error: 'Internal Server Error in Web BFF' });
  }
});

module.exports = router;
