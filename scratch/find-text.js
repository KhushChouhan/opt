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

console.log('Searching for error string in node_modules/next...');
let matches = [];

walkDir(targetDir, (filePath) => {
  // Only search text files
  if (!filePath.endsWith('.js') && !filePath.endsWith('.json')) return;

  try {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('For Next.js, Node.js version')) {
      console.log(`MATCH FOUND: ${filePath}`);
      matches.push(filePath);
    }
  } catch (err) {
    // Ignore read errors
  }
});

console.log(`Search completed. Found ${matches.length} files.`);
