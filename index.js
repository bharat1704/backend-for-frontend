const microservicesApp = require('./services/server');
const bffApp = require('./bff/server');

const MICROSERVICES_PORT = process.env.SERVICES_PORT || 4000;
const BFF_PORT = process.env.BFF_PORT || 5000;

const msServer = microservicesApp.listen(MICROSERVICES_PORT, () => {
  console.log(`[Core Microservices] Running on http://localhost:${MICROSERVICES_PORT}`);
});

const bffServer = bffApp.listen(BFF_PORT, () => {
  console.log(`[Backend For Frontend (BFF)] Running on http://localhost:${BFF_PORT}`);
  console.log(`\n================================================================`);
  console.log(`🎉 BFF Interactive Playground Ready!`);
  console.log(`👉 Open http://localhost:${BFF_PORT} in your web browser`);
  console.log(`================================================================`);
  console.log(`Available Endpoints:`);
  console.log(`  📱 Mobile BFF : http://localhost:${BFF_PORT}/api/mobile/dashboard/usr_101`);
  console.log(`  💻 Web BFF    : http://localhost:${BFF_PORT}/api/web/dashboard/usr_101`);
  console.log(`  📊 Compare API: http://localhost:${BFF_PORT}/api/compare/usr_101`);
  console.log(`  ⚙️ Downstream : http://localhost:${MICROSERVICES_PORT}/services/users/usr_101`);
  console.log(`================================================================\n`);
});

// Graceful shutdown handling
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  msServer.close();
  bffServer.close();
  process.exit(0);
});
