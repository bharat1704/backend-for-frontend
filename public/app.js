let currentPayload = null;

// Default to mobile scenario on initial load
document.addEventListener('DOMContentLoaded', () => {
  fetchScenario('mobile');
});

async function fetchScenario(type) {
  // Update button active state
  document.querySelectorAll('.nav-btn').forEach((btn) => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${type}`);
  if (activeBtn) activeBtn.classList.add('active');

  const mainContent = document.getElementById('main-content');
  const matrixPanel = document.getElementById('matrix-panel');
  const statsContainer = document.getElementById('stats-container');

  if (type === 'matrix') {
    mainContent.style.display = 'none';
    matrixPanel.style.display = 'block';
    loadMatrix();
    return;
  } else {
    mainContent.style.display = 'grid';
    matrixPanel.style.display = 'none';
  }

  const endpointChip = document.getElementById('endpoint-chip');
  const jsonCode = document.getElementById('json-code');
  const previewCanvas = document.getElementById('preview-canvas');

  jsonCode.textContent = 'Fetching data...';

  try {
    if (type === 'direct') {
      endpointChip.textContent = '3 REQUESTS: /services/users/usr_101 + /services/orders + /services/products';
      
      // Simulate client calling 3 services directly
      const [uRes, oRes, pRes] = await Promise.all([
        fetch('http://localhost:4000/services/users/usr_101'),
        fetch('http://localhost:4000/services/orders?userId=usr_101'),
        fetch('http://localhost:4000/services/products/recommended?userId=usr_101')
      ]);

      const user = await uRes.json();
      const orders = await oRes.json();
      const products = await pRes.json();

      const combined = { user, orders, products };
      currentPayload = combined;

      const sizeKb = (new Blob([JSON.stringify(combined)]).size / 1024).toFixed(2);

      updateStats({
        requests: '3 Separate',
        requestsSub: 'Multiple high-latency roundtrips',
        size: `${sizeKb} KB`,
        sizeSub: 'High bandwidth consumption',
        sizeClass: 'text-danger',
        security: 'VULNERABLE ⚠️',
        securitySub: 'Leaks password hash & audit IDs',
        securityClass: 'text-danger',
        effort: 'Heavy',
        effortSub: 'Client must parse, join & format'
      });

      renderDirectPreview(previewCanvas, combined);
      jsonCode.textContent = JSON.stringify(combined, null, 2);

    } else if (type === 'mobile') {
      endpointChip.textContent = 'GET /api/mobile/dashboard/usr_101 (1 Call)';

      const res = await fetch('/api/mobile/dashboard/usr_101');
      const data = await res.json();
      currentPayload = data;

      const sizeKb = (new Blob([JSON.stringify(data)]).size / 1024).toFixed(2);

      updateStats({
        requests: '1 Call',
        requestsSub: 'Aggregated by Mobile BFF',
        size: `${sizeKb} KB`,
        sizeSub: '80%+ Bandwidth saved',
        sizeClass: 'text-success',
        security: 'Sanitized 🛡️',
        securitySub: 'Only safe UI fields exposed',
        securityClass: 'text-safe',
        effort: 'Zero',
        effortSub: 'Pre-formatted for mobile widgets'
      });

      renderMobilePreview(previewCanvas, data);
      jsonCode.textContent = JSON.stringify(data, null, 2);

    } else if (type === 'web') {
      endpointChip.textContent = 'GET /api/web/dashboard/usr_101 (1 Call)';

      const res = await fetch('/api/web/dashboard/usr_101');
      const data = await res.json();
      currentPayload = data;

      const sizeKb = (new Blob([JSON.stringify(data)]).size / 1024).toFixed(2);

      updateStats({
        requests: '1 Call',
        requestsSub: 'Aggregated by Web BFF',
        size: `${sizeKb} KB`,
        sizeSub: 'Tailored for wide desktop',
        sizeClass: 'text-success',
        security: 'Sanitized 🛡️',
        securitySub: 'Zero internal data leaks',
        securityClass: 'text-safe',
        effort: 'Minimal',
        effortSub: 'Directly powers table & grid'
      });

      renderWebPreview(previewCanvas, data);
      jsonCode.textContent = JSON.stringify(data, null, 2);
    }
  } catch (err) {
    jsonCode.textContent = `Error connecting to backend services: ${err.message}\nEnsure both BFF and Microservice servers are running!`;
  }
}

function updateStats({ requests, requestsSub, size, sizeSub, sizeClass = '', security, securitySub, securityClass = '', effort, effortSub }) {
  document.getElementById('stat-requests').textContent = requests;
  document.getElementById('stat-requests-sub').textContent = requestsSub;
  
  const sizeEl = document.getElementById('stat-size');
  sizeEl.textContent = size;
  sizeEl.className = `stat-value ${sizeClass}`;
  document.getElementById('stat-size-sub').textContent = sizeSub;

  const secEl = document.getElementById('stat-security');
  secEl.textContent = security;
  secEl.className = `stat-value ${securityClass}`;
  document.getElementById('stat-security-sub').textContent = securitySub;

  document.getElementById('stat-effort').textContent = effort;
  document.getElementById('stat-effort-sub').textContent = effortSub;
}

// 1. Render Mobile UI Preview
function renderMobilePreview(container, data) {
  const user = data.user || {};
  const order = data.activeOrder || {};
  const picks = data.quickPicks || [];

  container.innerHTML = `
    <div class="phone-mockup">
      <div class="phone-header">
        <div>
          <div class="phone-user">${user.displayName || 'User'}</div>
          <small style="color:#94a3b8; font-size: 0.75rem;">${user.greeting || ''}</small>
        </div>
        <span class="phone-badge">${user.badge || 'Member'}</span>
      </div>

      ${order.orderId ? `
      <div class="phone-card">
        <div class="phone-card-title">Latest Order (${order.orderId})</div>
        <div class="phone-card-status">${order.statusText}</div>
        <div class="phone-card-meta">${order.itemsCount} • ${order.totalFormatted}</div>
      </div>
      ` : ''}

      <div>
        <div class="phone-section-title">Quick Picks For You</div>
        ${picks.map(p => `
          <div class="phone-pick-item">
            <img class="phone-thumb" src="${p.thumbnail}" alt="${p.title}" onerror="this.src='https://via.placeholder.com/80?text=Item'" />
            <div style="flex:1;">
              <div class="phone-pick-title">${p.title}</div>
              <div class="phone-pick-price">${p.priceFormatted} <span style="color:#fbbf24; font-size:0.7rem;">${p.ratingText}</span></div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// 2. Render Web Desktop UI Preview
function renderWebPreview(container, data) {
  const profile = data.userProfile || {};
  const orders = data.recentOrders || [];
  const recs = data.recommendedProducts || [];

  container.innerHTML = `
    <div class="desktop-mockup">
      <div class="desktop-header">
        <div>
          <h3 style="font-size:1.1rem; font-weight:700;">Account: ${profile.fullName}</h3>
          <p style="color:#94a3b8; font-size:0.8rem;">${profile.email} • ${profile.membership?.type}</p>
        </div>
        <span class="status-badge badge-delivered">${profile.membership?.expiresOn ? 'Active until ' + profile.membership.expiresOn : 'Active'}</span>
      </div>

      <div>
        <h4 style="font-size:0.85rem; margin-bottom:0.4rem; color:#94a3b8;">Recent Orders</h4>
        <table class="desktop-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(o => `
              <tr>
                <td style="font-family:var(--font-mono); font-weight:600;">${o.orderId}</td>
                <td>${o.date}</td>
                <td><span class="status-badge ${o.status.code === 'DELIVERED' ? 'badge-delivered' : 'badge-in-transit'}">${o.status.label}</span></td>
                <td style="font-weight:600;">${o.financials.totalFormatted}</td>
                <td><a href="#" style="color:#38bdf8; text-decoration:none;">${o.courier.partner}</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div>
        <h4 style="font-size:0.85rem; margin-bottom:0.4rem; color:#94a3b8;">Personalized Catalog Recommendations (${recs.length} items)</h4>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.5rem;">
          ${recs.slice(0, 2).map(r => `
            <div style="background:#1e293b; padding:0.6rem; border-radius:6px; font-size:0.75rem;">
              <strong style="display:block; margin-bottom:0.2rem;">${r.name}</strong>
              <span style="color:#34d399; font-weight:700;">${r.priceFormatted}</span>
              <span style="color:#94a3b8;"> • ${r.rating?.summaryText}</span>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// 3. Render Direct Microservices Anti-pattern Preview
function renderDirectPreview(container, data) {
  container.innerHTML = `
    <div class="warning-box">
      <h5>⚠️ Anti-Pattern: Direct Client-to-Microservices</h5>
      <p style="font-size:0.82rem; margin-bottom:0.75rem; color:#fca5a5;">
        The client had to issue <strong>3 separate network calls</strong> across the internet and received raw backend models containing internal secrets:
      </p>
      <ul class="warning-list">
        <li><strong>Security Leak:</strong> Exposed <code>hashedPassword</code>: "<code>${data.user?.data?.hashedPassword || '***'}</code>"</li>
        <li><strong>Audit Exposure:</strong> Leaked internal <code>internalAuditId</code>: "<code>${data.user?.data?.internalAuditId || '***'}</code>"</li>
        <li><strong>Trade Secret Leak:</strong> Leaked ML internal profit margin: "<code>marginPercentage: 45.2%</code>" and <code>internalSupplierId</code></li>
        <li><strong>Over-fetching:</strong> Downloaded heavy warehouse routing codes and tax ledgers never used by frontend screens</li>
        <li><strong>Client Latency:</strong> Mobile app had to wait for 3 network waterfalls over cellular connections</li>
      </ul>
    </div>
  `;
}

// 4. Matrix Comparison
async function loadMatrix() {
  const tbody = document.getElementById('matrix-tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading comparison metrics...</td></tr>';

  try {
    const res = await fetch('/api/compare/usr_101');
    const json = await res.json();
    const c = json.comparison;

    tbody.innerHTML = `
      <tr>
        <td><strong>Client Network Roundtrips</strong></td>
        <td class="col-bad">3 separate HTTP calls</td>
        <td class="col-mobile"><strong>1 single call</strong></td>
        <td class="col-web"><strong>1 single call</strong></td>
      </tr>
      <tr>
        <td><strong>Wire Payload Size</strong></td>
        <td class="col-bad">${c.directCalls.sizeFormatted} (Heavy over-fetching)</td>
        <td class="col-mobile"><strong>${c.mobileBff.sizeFormatted} (${c.mobileBff.bandwidthSavedPercent} saved)</strong></td>
        <td class="col-web"><strong>${c.webBff.sizeFormatted} (Optimized)</strong></td>
      </tr>
      <tr>
        <td><strong>Security & Data Masking</strong></td>
        <td class="col-bad">${c.directCalls.securityRisk}</td>
        <td class="col-mobile">${c.mobileBff.securityRisk}</td>
        <td class="col-web">${c.webBff.securityRisk}</td>
      </tr>
      <tr>
        <td><strong>Client-side Processing</strong></td>
        <td class="col-bad">${c.directCalls.clientEffort}</td>
        <td class="col-mobile">${c.mobileBff.clientEffort}</td>
        <td class="col-web">${c.webBff.clientEffort}</td>
      </tr>
      <tr>
        <td><strong>Team Autonomy & Ownership</strong></td>
        <td class="col-bad">Bottleneck: Mobile/Web team must request core service changes</td>
        <td class="col-mobile"><strong>High:</strong> Mobile team owns & ships their BFF independently</td>
        <td class="col-web"><strong>High:</strong> Web team owns & ships their BFF independently</td>
      </tr>
      <tr>
        <td><strong>Coupling to Schema Changes</strong></td>
        <td class="col-bad">Tight: Core backend DB changes can crash older mobile apps</td>
        <td class="col-mobile">Loose: Mobile BFF insulates mobile apps from backend changes</td>
        <td class="col-web">Loose: Web BFF adapts seamlessly</td>
      </tr>
    `;
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error loading comparison: ${err.message}</td></tr>`;
  }
}

function copyJson() {
  if (!currentPayload) return;
  navigator.clipboard.writeText(JSON.stringify(currentPayload, null, 2));
  alert('Copied JSON payload to clipboard!');
}
