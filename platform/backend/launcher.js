const readline = require('readline');
const path = require('path');
const fs = require('fs');
require('bytenode');

// Parse CLI Arguments
const args = process.argv.slice(2);
let mode = '1';
let port = process.env.PORT || '3000';
let host = '127.0.0.1';

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--port' && args[i + 1]) {
    port = args[i + 1];
  }
  if (args[i] === '--mode' && args[i + 1]) {
    mode = args[i + 1] === 'cloud' ? '2' : '1';
  }
  if (args[i] === '--host' && args[i + 1]) {
    host = args[i + 1];
  }
}

function startEngine(selectedHost, selectedPort) {
  process.env.PORT = selectedPort;
  process.env.HOST = selectedHost;

  console.log('\n============================================================');
  console.log('✔ TICKETFORGE BLACK-BOX ENGINE ACTIVE');
  console.log('============================================================');
  console.log(`  • Visual Website UI:  http://${selectedHost === '0.0.0.0' ? 'localhost' : selectedHost}:${selectedPort}`);
  console.log(`  • Public REST APIs:   http://${selectedHost === '0.0.0.0' ? 'localhost' : selectedHost}:${selectedPort}/api/v1/trains`);
  console.log(`  • OPS Control Plane:  http://${selectedHost === '0.0.0.0' ? 'localhost' : selectedHost}:${selectedPort}/ops`);
  console.log('============================================================');
  console.log(' [Press Ctrl+C to Stop Engine]\n');

  const jscPath = path.join(__dirname, 'server.jsc');
  const jsPath = path.join(__dirname, 'server.js');

  if (fs.existsSync(jscPath)) {
    require(jscPath);
  } else if (fs.existsSync(jsPath)) {
    require(jsPath);
  } else {
    console.error('Fatal: Server entrypoint file not found.');
    process.exit(1);
  }
}

// If CLI args provided, skip interactive prompts
if (args.length > 0) {
  const selectedHost = mode === '2' ? '0.0.0.0' : host;
  startEngine(selectedHost, port);
} else {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log('\n============================================================');
  console.log('  TICKETFORGE BLACK-BOX PLATFORM LAUNCHER V1.0');
  console.log('============================================================\n');
  console.log(' Select Hosting Mode:');
  console.log(' [1] Local Self-Host (127.0.0.1 - Local PC)');
  console.log(' [2] Cloud / Network Host (0.0.0.0 - Cloud / Remote Server)\n');

  rl.question(' Choice [1/2] (Default: 1): ', (modeAnswer) => {
    const chosenMode = modeAnswer.trim() || '1';
    const chosenHost = chosenMode === '2' ? '0.0.0.0' : '127.0.0.1';

    rl.question(' Enter Port (Default: 3000): ', (portAnswer) => {
      const chosenPort = portAnswer.trim() || '3000';
      rl.close();
      startEngine(chosenHost, chosenPort);
    });
  });
}
