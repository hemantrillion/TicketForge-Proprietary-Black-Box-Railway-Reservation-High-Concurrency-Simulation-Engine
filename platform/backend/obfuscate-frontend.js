const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const frontendBuildDir = path.join(__dirname, '../frontend/build/static/js');

console.log('=====================================================');
console.log('  FRONTEND CONTROL-FLOW OBFUSCATION PIPELINE         ');
console.log('=====================================================');

if (fs.existsSync(frontendBuildDir)) {
  const files = fs.readdirSync(frontendBuildDir).filter(f => f.endsWith('.js'));
  files.forEach(file => {
    const filePath = path.join(frontendBuildDir, file);
    console.log(`[OBFUSCATING] ${file}...`);
    const code = fs.readFileSync(filePath, 'utf8');
    
    const obfuscatedResult = JavaScriptObfuscator.obfuscate(code, {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 0.75,
      numbersToExpressions: true,
      simplify: true,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayThreshold: 0.75,
      splitStrings: true,
      splitStringsChunkLength: 10,
      identifierNamesGenerator: 'hexadecimal'
    });

    fs.writeFileSync(filePath, obfuscatedResult.getObfuscatedCode(), 'utf8');
  });
  console.log('-----------------------------------------------------');
  console.log('✔ Frontend Control-Flow Obfuscation Complete!');
  console.log('=====================================================');
} else {
  console.log('[INFO] Frontend build directory not found. Skipping static asset obfuscation.');
}
