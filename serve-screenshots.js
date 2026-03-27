const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "store-assets/screenshots");
const GP_DIR = path.join(__dirname, "store-assets/google-play");
const PORT = 3000;

const iosFiles = [
  { name: "ios-01-home.png", label: "1 – Day Selection" },
  { name: "ios-02-logging.png", label: "2 – Set Logging" },
  { name: "ios-03-timer.png", label: "3 – Rest Timer" },
  { name: "ios-04-weeks.png", label: "4 – 12-Week Program" },
  { name: "ios-05-settings.png", label: "5 – kg/lbs & Dark Mode" },
];

const iphone65Files = [
  { name: "ios-01-home.png", label: "1 – Day Selection (1242×2688)" },
  { name: "ios-02-logging.png", label: "2 – Set Logging (1242×2688)" },
  { name: "ios-03-timer.png", label: "3 – Rest Timer (1242×2688)" },
  { name: "ios-04-weeks.png", label: "4 – 12-Week Program (1242×2688)" },
  { name: "ios-05-settings.png", label: "5 – kg/lbs & Dark Mode (1242×2688)" },
];

const ipad13Files = [
  { name: "ios-01-home.png", label: "1 – Day Selection (2048×2732)" },
  { name: "ios-02-logging.png", label: "2 – Set Logging (2048×2732)" },
  { name: "ios-03-timer.png", label: "3 – Rest Timer (2048×2732)" },
  { name: "ios-04-weeks.png", label: "4 – 12-Week Program (2048×2732)" },
  { name: "ios-05-settings.png", label: "5 – kg/lbs & Dark Mode (2048×2732)" },
];

const gpFiles = [
  { path: "icon-512.png", label: "App Icon (512×512 PNG)" },
  { path: "feature-graphic-1024x500.png", label: "Feature Graphic (1024×500 PNG)" },
  { path: "phone/android-01.png", label: "Phone Screenshot 1 – Day Selection (1284×2284)" },
  { path: "phone/android-02.png", label: "Phone Screenshot 2 – Set Logging (1284×2284)" },
  { path: "phone/android-03.png", label: "Phone Screenshot 3 – Rest Timer (1284×2284)" },
  { path: "phone/android-04.png", label: "Phone Screenshot 4 – 12-Week Program (1284×2284)" },
  { path: "phone/android-05.png", label: "Phone Screenshot 5 – kg/lbs & Dark Mode (1284×2284)" },
  { path: "tablet-7/android-01.png", label: "7\" Tablet Screenshot 1 (1080×1920)" },
  { path: "tablet-7/android-02.png", label: "7\" Tablet Screenshot 2 (1080×1920)" },
  { path: "tablet-7/android-03.png", label: "7\" Tablet Screenshot 3 (1080×1920)" },
  { path: "tablet-7/android-04.png", label: "7\" Tablet Screenshot 4 (1080×1920)" },
  { path: "tablet-7/android-05.png", label: "7\" Tablet Screenshot 5 (1080×1920)" },
  { path: "tablet-10/android-01.png", label: "10\" Tablet Screenshot 1 (1600×2560)" },
  { path: "tablet-10/android-02.png", label: "10\" Tablet Screenshot 2 (1600×2560)" },
  { path: "tablet-10/android-03.png", label: "10\" Tablet Screenshot 3 (1600×2560)" },
  { path: "tablet-10/android-04.png", label: "10\" Tablet Screenshot 4 (1600×2560)" },
  { path: "tablet-10/android-05.png", label: "10\" Tablet Screenshot 5 (1600×2560)" },
];

const server = http.createServer((req, res) => {
  if (req.url === "/privacy-policy" || req.url === "/privacy-policy.html") {
    const pp = path.join(__dirname, "store-assets/privacy-policy.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(pp).pipe(res);
    return;
  }

  if (req.url === "/google-play-assets.tar.gz") {
    const archivePath = path.join(__dirname, "store-assets/google-play-assets.tar.gz");
    res.writeHead(200, {
      "Content-Type": "application/gzip",
      "Content-Disposition": 'attachment; filename="google-play-assets.tar.gz"',
    });
    fs.createReadStream(archivePath).pipe(res);
    return;
  }

  if (req.url.startsWith("/gp/")) {
    const relativePath = req.url.replace("/gp/", "");
    const filePath = path.join(GP_DIR, relativePath);
    if (fs.existsSync(filePath) && relativePath.endsWith(".png")) {
      const fileName = path.basename(filePath);
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  if (req.url === "/google-play") {
    const gpLinks = gpFiles
      .map(
        (f) =>
          `<a href="/gp/${f.path}" download="${path.basename(f.path)}" style="display:block;padding:14px 0;font-size:15px;color:#f59e0b;border-bottom:1px solid #2a2a2a;text-decoration:none;">
            ⬇ ${f.label}
          </a>`
      )
      .join("");

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>IronSplit – Google Play Assets</title>
  <style>
    body{margin:0;background:#111;color:#fff;font-family:sans-serif;padding:24px;}
    h1{color:#f59e0b;font-size:22px;margin-bottom:4px;}
    p{color:#888;font-size:14px;margin-bottom:24px;}
    .bundle{display:block;padding:16px 20px;background:#f59e0b;color:#111;font-weight:700;font-size:16px;border-radius:8px;text-decoration:none;margin-bottom:28px;text-align:center;}
  </style>
</head>
<body>
  <h1>Google Play Store Assets</h1>
  <p>Download all assets below or grab the full bundle.</p>
  <a class="bundle" href="/google-play-assets.tar.gz" download="google-play-assets.tar.gz">⬇ Download All as .tar.gz</a>
  ${gpLinks}
</body>
</html>`);
    return;
  }

  if (req.url.startsWith("/iphone-6-5/")) {
    const fileName = req.url.replace("/iphone-6-5/", "");
    const filePath = path.join(DIR, "iphone-6-5", fileName);
    if (fileName && fs.existsSync(filePath) && fileName.endsWith(".png")) {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  if (req.url.startsWith("/ipad-13/")) {
    const fileName = req.url.replace("/ipad-13/", "");
    const filePath = path.join(DIR, "ipad-13", fileName);
    if (fileName && fs.existsSync(filePath) && fileName.endsWith(".png")) {
      res.writeHead(200, {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  const fileName = req.url.replace("/", "");
  const filePath = path.join(DIR, fileName);

  if (fileName && fs.existsSync(filePath) && fileName.endsWith(".png")) {
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  const iosLinks = iosFiles
    .map(
      (f) =>
        `<a href="/${f.name}" download="${f.name}" style="display:block;padding:14px 0;font-size:15px;color:#f59e0b;border-bottom:1px solid #2a2a2a;text-decoration:none;">
          ⬇ ${f.label}
        </a>`
    )
    .join("");

  const iphone65Links = iphone65Files
    .map(
      (f) =>
        `<a href="/iphone-6-5/${f.name}" download="${f.name}" style="display:block;padding:14px 0;font-size:15px;color:#f59e0b;border-bottom:1px solid #2a2a2a;text-decoration:none;">
          ⬇ ${f.label}
        </a>`
    )
    .join("");

  const ipad13Links = ipad13Files
    .map(
      (f) =>
        `<a href="/ipad-13/${f.name}" download="${f.name}" style="display:block;padding:14px 0;font-size:15px;color:#f59e0b;border-bottom:1px solid #2a2a2a;text-decoration:none;">
          ⬇ ${f.label}
        </a>`
    )
    .join("");

  res.writeHead(200, { "Content-Type": "text/html" });
  res.end(`<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>IronSplit Screenshots</title>
  <style>
    body{margin:0;background:#111;color:#fff;font-family:sans-serif;padding:24px;}
    h1{color:#f59e0b;font-size:22px;margin-bottom:4px;}
    h2{color:#f59e0b;font-size:16px;margin:28px 0 4px;}
    p{color:#888;font-size:13px;margin:0 0 12px;}
    .nav{display:block;padding:12px 20px;background:#222;color:#f59e0b;font-size:14px;border-radius:8px;text-decoration:none;margin-bottom:24px;text-align:center;}
    .section{background:#1a1a1a;border-radius:10px;padding:12px 18px;margin-bottom:20px;}
  </style>
</head>
<body>
  <h1>IronSplit – iOS App Store Screenshots</h1>
  <a class="nav" href="/google-play">📦 Google Play Store Assets →</a>

  <div class="section">
    <h2>6.7-inch iPhone (1284×2778) — iPhone 14 Pro Max slot</h2>
    <p>Upload these to the 6.7" iPhone display slot in App Store Connect.</p>
    ${iosLinks}
  </div>

  <div class="section">
    <h2>6.5-inch iPhone (1242×2688) — required slot</h2>
    <p>Upload these to the 6.5" iPhone display slot in App Store Connect.</p>
    ${iphone65Links}
  </div>

  <div class="section">
    <h2>13-inch iPad Pro (2048×2732) — required slot</h2>
    <p>Upload these to the iPad Pro 13" display slot in App Store Connect.</p>
    ${ipad13Links}
  </div>
</body>
</html>`);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Screenshot server running on port ${PORT}`);
});
