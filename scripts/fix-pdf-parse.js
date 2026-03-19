// Fix for pdf-parse test file dependency
// pdf-parse v2.x tries to read test/data/05-versions-space.pdf on import
// This script creates a dummy file so it doesn't crash
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "node_modules", "pdf-parse", "test", "data");
const file = path.join(dir, "05-versions-space.pdf");

if (!fs.existsSync(file)) {
  fs.mkdirSync(dir, { recursive: true });
  // Minimal valid PDF (1 blank page)
  const minPdf = Buffer.from(
    "%PDF-1.0\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n3 0 obj<</Type/Page/MediaBox[0 0 3 3]/Parent 2 0 R>>endobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n190\n%%EOF"
  );
  fs.writeFileSync(file, minPdf);
  console.log("✓ pdf-parse test file fix applied");
}
