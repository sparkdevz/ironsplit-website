const http = require("http");
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "store-assets/screenshots");
const PORT = 3000;

const files = [
  { name: "ios-01-home.png", label: "1 – Day Selection" },
  { name: "ios-02-logging.png", label: "2 – Set Logging" },
  { name: "ios-03-timer.png", label: "3 – Rest Timer" },
  { name: "ios-04-weeks.png", label: "4 – 12-Week Program" },
  { name: "ios-05-settings.png", label: "5 – kg/lbs & Dark Mode" },
];

const server = http.createServer((req, res) => {
  if (req.url === "/privacy-policy" || req.url === "/privacy-policy.html") {
    const pp = path.join(__dirname, "store-assets/privacy-policy.html");
    res.writeHead(200, { "Content-Type": "text/html" });
    fs.createReadStream(pp).pipe(res);
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

  const links = files
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
  </style>
</head>
<body>
  <h1>IronSplit Screenshots</h1>
  <p>Tap a link to download the image to your phone.</p>
  ${links}
</body>
</html>`);
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Screenshot server running on port ${PORT}`);
});
