const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach((f) => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    if (isDirectory) {
      walkDir(dirPath, callback);
    } else {
      callback(dirPath);
    }
  });
}

const targetDir = path.resolve(__dirname, '../node_modules/next');
if (!fs.existsSync(targetDir)) {
  console.error('node_modules/next directory does not exist!');
  process.exit(1);
}

console.log('Searching and patching Node.js version check in node_modules/next...');
let patchedCount = 0;

walkDir(targetDir, (filePath) => {
  // Only search text files in dist and package.json
  if (!filePath.endsWith('.js') && !filePath.endsWith('.json')) return;

  try {
    let content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('18.17.0')) {
      console.log(`Found version check in: ${filePath}`);
      const updatedContent = content.replace(/18\.17\.0/g, '18.15.0');
      fs.writeFileSync(filePath, updatedContent, 'utf8');
      patchedCount++;
    }
  } catch (err) {
    // Ignore read/write errors for locked files
  }
});

console.log(`Patching completed. Modified ${patchedCount} files.`);
