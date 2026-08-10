const bytenode = require('bytenode');
const fs = require('fs');
const path = require('path');

console.log('=====================================================');
console.log('  TICKETFORGE V8 BYTECODE COMPILATION PIPELINE      ');
console.log('=====================================================');

const filesToCompile = [
  'server.js',
  'config/db.js',
  'services/user-service/index.js',
  'services/events-service/index.js',
  'services/seat-service/seat-state-store.js',
  'services/booking-service/create-booking.js',
  'services/payment-service/payment-provider-adapter.js'
];

filesToCompile.forEach(relPath => {
  const fullPath = path.join(__dirname, relPath);
  if (fs.existsSync(fullPath)) {
    const outputJsc = fullPath.replace(/\.js$/, '.jsc');
    console.log(`[COMPILING BYTECODE] ${relPath} ──> ${path.basename(outputJsc)}`);
    bytenode.compileFile({
      filename: fullPath,
      output: outputJsc,
      compileAsModule: true
    });
  } else {
    console.warn(`[WARNING] File not found: ${relPath}`);
  }
});

// Create Entrypoint Bytecode Loader
const loaderCode = `// TicketForge Black-Box V8 Bytecode Loader
require('bytenode');
require('./server.jsc');
`;

fs.writeFileSync(path.join(__dirname, 'index.js'), loaderCode, 'utf8');
console.log('-----------------------------------------------------');
console.log('✔ V8 Bytecode Compilation Complete!');
console.log('  All backend logic compiled into binary .jsc files.');
console.log('  Entrypoint loader created: index.js -> server.jsc');
console.log('=====================================================');
