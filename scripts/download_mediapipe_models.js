const fs = require('fs');
const path = require('path');
const https = require('https');

const targetDir = path.resolve(__dirname, '../public/libs/mediapipe');

const FILES_TO_DOWNLOAD = [
  {
    url: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hand_landmark_full.tflite',
    dest: 'hand_landmark_full.tflite'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hand_landmark_lite.tflite',
    dest: 'hand_landmark_lite.tflite'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.binarypb',
    dest: 'hands.binarypb'
  },
  {
    url: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.binarypb',
    dest: 'face_mesh.binarypb'
  }
];

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    console.log(`Downloading ${url} -> ${destPath}...`);
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: status code ${res.statusCode}`));
        return;
      }
      const fileStream = fs.createWriteStream(destPath);
      res.pipe(fileStream);
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Successfully saved ${destPath}`);
        resolve();
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  for (const item of FILES_TO_DOWNLOAD) {
    const destPath = path.join(targetDir, item.dest);
    try {
      await downloadFile(item.url, destPath);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err.message);
    }
  }
  console.log('All downloads completed.');
}

main();
