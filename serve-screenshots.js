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
        `<a href="/${f.name}" download="${f.name}" style="display:block;padding:18px 0;font-size:18px;color:#f59e0b;border-bottom:1px solid #2a2a2a;text-decoration:none;">
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
    p{color:#888;font-size:14px;margin-bottom:24px;}
    .nav{display:block;padding:12px 20px;background:#222;color:#f59e0b;font-size:14px;border-radius:8px;text-decoration:none;margin-bottom:24px;text-align:center;}
  </style>
</head>
<body>
  <h1>IronSplit Screenshots</h1>
  <a class="nav" href="/google-play">📦 Google Play Store Assets →</a>
  <p>iOS App Store screenshots:</p>
  ${iosLinks}
</body>
</html>`);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Screenshot server running on port ${PORT}`);
});
