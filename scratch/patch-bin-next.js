const fs = require('fs');
const path = require('path');

const filePath = path.resolve(__dirname, '../node_modules/next/dist/bin/next');

if (!fs.existsSync(filePath)) {
  console.error('File not found:', filePath);
  process.exit(1);
}

try {
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.includes('18.17.0')) {
    console.log('Found version check in next binary. Replacing...');
    content = content.replace(/"18\.17\.0"/g, '"18.15.0"');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Successfully patched next binary.');
  } else {
    console.log('Version check not found in next binary (already patched or different version).');
  }
} catch (err) {
  console.error('Error patching next binary:', err);
  process.exit(1);
}
