const pkg = require('@yao-pkg/pkg');
const path = require('path');
const fs = require('fs');

console.log('=====================================================');
console.log('  PACKAGING NATIVE EXECUTABLES VIA @YAO-PKG/PKG       ');
console.log('=====================================================');

const outputDir = path.join(__dirname, '../../dist');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function buildBinaries() {
  try {
    console.log('[BUILDING BINARIES] Compiling Windows, Linux, and Mac executables...');
    await pkg.exec([
      path.join(__dirname, 'index.js'),
      '--targets', 'node18-win-x64,node18-linux-x64,node18-macos-x64',
      '--out-path', outputDir
    ]);
    console.log('-----------------------------------------------------');
    console.log('✔ Native Executable Packaging Complete!');
    console.log(`  Binaries created in: ${outputDir}`);
    console.log('=====================================================');
  } catch (err) {
    console.error('Packaging error:', err);
  }
}

buildBinaries();
