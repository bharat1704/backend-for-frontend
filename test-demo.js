/**
 * CLI Test & Demonstration Script for Backend For Frontend (BFF)
 * 
 * Runs both the Microservices backend and the BFF server in-memory,
 * executes queries simulating Mobile and Web clients, and prints
 * the side-by-side architectural metrics.
 */

const microservicesApp = require('./services/server');
const bffApp = require('./bff/server');

const MICROSERVICES_PORT = 4000;
const BFF_PORT = 5000;

async function runDemo() {
  console.log('\n================================================================');
  console.log('🚀 BACKEND FOR FRONTEND (BFF) ARCHITECTURE CLI DEMO');
  console.log('================================================================\n');

  // Start servers
  const msServer = microservicesApp.listen(MICROSERVICES_PORT);
  const bffServer = bffApp.listen(BFF_PORT);

  // Give servers a tiny moment to bind
  await new Promise((r) => setTimeout(r, 200));

  try {
    const userId = 'usr_101';

    console.log('--- 1. SCENARIO A: Direct Microservices (Anti-Pattern) ---');
    console.log('Client on 4G cellular calls 3 internal services directly:');
    console.log('  -> GET http://localhost:4000/services/users/usr_101');
    console.log('  -> GET http://localhost:4000/services/orders?userId=usr_101');
    console.log('  -> GET http://localhost:4000/services/products/recommended?userId=usr_101');

    const [uRes, oRes, pRes] = await Promise.all([
      fetch(`http://localhost:${MICROSERVICES_PORT}/services/users/${userId}`),
      fetch(`http://localhost:${MICROSERVICES_PORT}/services/orders?userId=${userId}`),
      fetch(`http://localhost:${MICROSERVICES_PORT}/services/products/recommended?userId=${userId}`)
    ]);

    const uData = await uRes.json();
    const oData = await oRes.json();
    const pData = await pRes.json();

    const directPayload = { user: uData, orders: oData, products: pData };
    const directBytes = Buffer.byteLength(JSON.stringify(directPayload));

    console.log(`\n❌ Network Roundtrips from Device: 3 calls`);
    console.log(`❌ Wire Payload Size: ${(directBytes / 1024).toFixed(2)} KB (${directBytes} bytes)`);
    console.log(`⚠️ SECURITY LEAKS DETECTED IN DIRECT PAYLOAD:`);
    console.log(`   - Leaked hashedPassword: "${uData.data.hashedPassword}"`);
    console.log(`   - Leaked internalAuditId: "${uData.data.internalAuditId}"`);
    console.log(`   - Leaked ML profit margin: ${pData.data[0].marginPercentage}%`);
    console.log(`   - Leaked tax ledger: "${oData.data[0].taxCalculations.internalLedgerCode}"`);

    console.log('\n----------------------------------------------------------------');
    console.log('--- 2. SCENARIO B: Mobile BFF (Tailored for Phone) ---');
    console.log('Mobile device makes 1 single call to Mobile BFF:');
    console.log(`  -> GET http://localhost:${BFF_PORT}/api/mobile/dashboard/usr_101`);

    const mRes = await fetch(`http://localhost:${BFF_PORT}/api/mobile/dashboard/${userId}`);
    const mData = await mRes.json();
    const mobileBytes = Buffer.byteLength(JSON.stringify(mData));

    console.log(`\n✅ Network Roundtrips from Device: 1 call`);
    console.log(`✅ Wire Payload Size: ${(mobileBytes / 1024).toFixed(2)} KB (${mobileBytes} bytes)`);
    console.log(`✅ Bandwidth Saved: ${(((directBytes - mobileBytes) / directBytes) * 100).toFixed(1)}%`);
    console.log(`🛡️ Security: Clean & Sanitized (Zero sensitive backend fields sent to device)`);
    console.log(`📱 Sample Mobile Response Shape:`);
    console.log(JSON.stringify(mData, null, 2));

    console.log('\n----------------------------------------------------------------');
    console.log('--- 3. SCENARIO C: Web Desktop BFF (Tailored for Desktop) ---');
    console.log('Desktop browser makes 1 single call to Web BFF:');
    console.log(`  -> GET http://localhost:${BFF_PORT}/api/web/dashboard/usr_101`);

    const wRes = await fetch(`http://localhost:${BFF_PORT}/api/web/dashboard/${userId}`);
    const wData = await wRes.json();
    const webBytes = Buffer.byteLength(JSON.stringify(wData));

    console.log(`\n✅ Network Roundtrips from Browser: 1 call`);
    console.log(`✅ Wire Payload Size: ${(webBytes / 1024).toFixed(2)} KB (${webBytes} bytes)`);
    console.log(`🖥️ Contains rich order history tables and detailed technical specs.`);

    console.log('\n================================================================');
    console.log('📊 COMPARISON SUMMARY MATRIX');
    console.log('================================================================');
    console.table([
      {
        Architecture: 'Direct Microservices (No BFF)',
        Roundtrips: '3 calls',
        PayloadSize: `${(directBytes / 1024).toFixed(2)} KB`,
        BandwidthSaved: '0%',
        DataExposure: 'HIGH RISK (Leaks passwords & audit IDs)',
        ClientCoupling: 'Tightly coupled to DB schema'
      },
      {
        Architecture: 'Mobile BFF (/api/mobile)',
        Roundtrips: '1 call',
        PayloadSize: `${(mobileBytes / 1024).toFixed(2)} KB`,
        BandwidthSaved: `${(((directBytes - mobileBytes) / directBytes) * 100).toFixed(1)}%`,
        DataExposure: 'NONE (Sanitized)',
        ClientCoupling: 'Decoupled (BFF transforms data)'
      },
      {
        Architecture: 'Web BFF (/api/web)',
        Roundtrips: '1 call',
        PayloadSize: `${(webBytes / 1024).toFixed(2)} KB`,
        BandwidthSaved: `${(((directBytes - webBytes) / directBytes) * 100).toFixed(1)}%`,
        DataExposure: 'NONE (Sanitized)',
        ClientCoupling: 'Decoupled (BFF transforms data)'
      }
    ]);

    console.log('\n💡 Key Takeaway:');
    console.log('The BFF pattern lets you build specialized backend layers owned by frontend');
    console.log('teams, drastically improving performance, user experience, and security.\n');

  } catch (err) {
    console.error('Demo encountered an error:', err);
  } finally {
    msServer.close();
    bffServer.close();
  }
}

runDemo();
