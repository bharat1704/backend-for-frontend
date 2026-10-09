// Adapter to interact with internal Core Microservices
// The BFF connects to downstream microservices over high-speed, secure internal network.

const SERVICES_BASE_URL = process.env.SERVICES_URL || 'http://localhost:4000';

async function fetchUser(userId) {
  try {
    const res = await fetch(`${SERVICES_BASE_URL}/services/users/${userId}`);
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`User service returned ${res.status}`);
    }
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error(`[BFF Adapter Error] Failed to fetch user ${userId}:`, err.message);
    throw err;
  }
}

async function fetchOrders(userId) {
  try {
    const res = await fetch(`${SERVICES_BASE_URL}/services/orders?userId=${userId}`);
    if (!res.ok) throw new Error(`Order service returned ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`[BFF Adapter Error] Failed to fetch orders for ${userId}:`, err.message);
    return []; // Return graceful fallback
  }
}

async function fetchRecommendations(userId) {
  try {
    const res = await fetch(`${SERVICES_BASE_URL}/services/products/recommended?userId=${userId}`);
    if (!res.ok) throw new Error(`Recommendation service returned ${res.status}`);
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error(`[BFF Adapter Error] Failed to fetch recommendations:`, err.message);
    return []; // Return graceful fallback
  }
}

module.exports = {
  fetchUser,
  fetchOrders,
  fetchRecommendations
};
