import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const width = 1200;
const height = 630;

const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#020617"/>
      <stop offset="50%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#022c22"/>
    </linearGradient>
    <linearGradient id="brandGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#10b981"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="30%" r="50%">
      <stop offset="0%" stop-color="#059669" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#059669" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- Background -->
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>

  <!-- Border Frame -->
  <rect x="24" y="24" width="${width - 48}" height="${height - 48}" rx="24" fill="none" stroke="#1e293b" stroke-width="2"/>

  <!-- Shield Icon -->
  <g transform="translate(100, 140)">
    <rect width="96" height="96" rx="24" fill="#047857" opacity="0.3"/>
    <path d="M48 16 L20 28 V52 C20 72 32 86 48 92 C64 86 76 72 76 52 V28 Z" fill="none" stroke="#34d399" stroke-width="6" stroke-linejoin="round"/>
    <path d="M36 50 L44 58 L60 42" fill="none" stroke="#6ee7b7" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>
  </g>

  <!-- Title & Subtitle -->
  <text x="220" y="200" font-family="system-ui, -apple-system, sans-serif" font-size="72" font-weight="800" fill="url(#brandGrad)" letter-spacing="-1">CloakKit</text>
  <text x="540" y="195" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="600" fill="#a7f3d0" letter-spacing="1">ZERO-DEPENDENCY</text>

  <text x="100" y="300" font-family="system-ui, -apple-system, sans-serif" font-size="38" font-weight="700" fill="#f8fafc">
    Detect &amp; Redact Secrets &amp; PII for AI Prompts
  </text>
  
  <text x="100" y="355" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="400" fill="#94a3b8">
    Your text never leaves your browser. The page makes no network requests after it loads.
  </text>

  <!-- Badges Grid -->
  <g transform="translate(100, 430)">
    <!-- Badge 1 -->
    <rect x="0" y="0" width="220" height="52" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="20" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#38bdf8">NPM Library</text>

    <!-- Badge 2 -->
    <rect x="240" y="0" width="200" height="52" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="260" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#fbbf24">CLI: npx cloakkit</text>

    <!-- Badge 3 -->
    <rect x="460" y="0" width="220" height="52" rx="12" fill="#0f172a" stroke="#334155" stroke-width="1.5"/>
    <text x="480" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#a855f7">Vite + React Web App</text>

    <!-- Badge 4 -->
    <rect x="700" y="0" width="280" height="52" rx="12" fill="#042f2e" stroke="#059669" stroke-width="1.5"/>
    <text x="720" y="33" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="600" fill="#34d399">connect-src 'none' CSP</text>
  </g>

  <!-- Footer Tagline -->
  <text x="100" y="555" font-family="monospace" font-size="18" fill="#64748b">
    MIT License • Browser / Node 18+ / Deno • Sub-10KB Gzipped
  </text>
</svg>
`;

async function main() {
  const publicDir = path.resolve(__dirname, '../apps/web/public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: width,
    },
  });

  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  const outputPath = path.join(publicDir, 'og.png');
  fs.writeFileSync(outputPath, pngBuffer);
  console.log(`✓ OpenGraph image successfully generated at: ${outputPath} (${pngBuffer.length} bytes)`);
}

main().catch((err) => {
  console.error('Failed to generate OG image:', err);
  process.exit(1);
});
