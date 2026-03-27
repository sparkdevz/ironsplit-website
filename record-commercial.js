const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const COMMERCIAL_URL = 'http://localhost:3001/';
const DURATION_MS = 30000;
const OUTPUT_DIR = path.join(__dirname, 'store-assets');
const MP4_PATH = path.join(OUTPUT_DIR, 'ironsplit-commercial.mp4');
const VIDEO_DIR = path.join(__dirname, '.tmp-recording');

// Use nix-installed Chromium which has correct system libraries
const CHROMIUM_PATH = '/nix/store/qa9cnw4v5xkxyip6mb9kxqfq1z4x2dx1-chromium-138.0.7204.100/bin/chromium';

(async () => {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    executablePath: CHROMIUM_PATH,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1280, height: 720 },
    },
  });

  const page = await context.newPage();

  console.log(`Opening ${COMMERCIAL_URL}...`);
  await page.goto(COMMERCIAL_URL, { waitUntil: 'networkidle' });

  console.log(`Recording for ${DURATION_MS / 1000}s...`);
  await page.waitForTimeout(DURATION_MS + 1500);

  const videoPath = await page.video().path();
  await context.close();
  await browser.close();

  console.log(`Browser closed, video at: ${videoPath}`);

  const webmPath = path.join(OUTPUT_DIR, 'commercial.webm');
  fs.copyFileSync(videoPath, webmPath);
  fs.rmSync(VIDEO_DIR, { recursive: true, force: true });

  console.log('Converting to MP4...');
  execSync(
    `ffmpeg -y -i "${webmPath}" -c:v libx264 -preset fast -crf 18 -pix_fmt yuv420p -movflags +faststart "${MP4_PATH}"`,
    { stdio: 'inherit' }
  );

  fs.rmSync(webmPath, { force: true });

  console.log(`\nDone! MP4 saved to: ${MP4_PATH}`);
})();
