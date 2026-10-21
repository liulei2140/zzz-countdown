#!/usr/bin/env node
/**
 * Render the Open Graph / social card for the site.
 *
 * The card is composed as SVG (so every date is exactly the string we ship on
 * the pages) and rasterised with sharp, which is already a dependency of the
 * template through Astro's image service.
 *
 * Run: node scripts/og-image.mjs
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = resolve(root, 'src/assets/images');
const outFile = resolve(outDir, 'og-zzz-3-3.png');

const W = 1200;
const H = 628;

const rows = [
  ['Version 3.3 goes live', 'Oct 21, 11:00 (UTC+8)'],
  ['Phase I banners end', 'Nov 11, 11:59 (server time)'],
  ['Phase II banners end', 'Dec 1, 14:59 (server time)'],
  ['Version 3.3 ends', 'Dec 2, 06:00 (UTC+8)'],
];

const escape = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const rowMarkup = rows
  .map(([label, value], i) => {
    const y = 424 + i * 48;
    return `
    <text x="72" y="${y}" font-family="DejaVu Sans, sans-serif" font-size="23" fill="#93a4c4">${escape(label)}</text>
    <text x="1128" y="${y}" text-anchor="end" font-family="DejaVu Sans, sans-serif" font-size="23" font-weight="bold" fill="#e8eefc">${escape(value)}</text>
    <line x1="72" y1="${y + 16}" x2="1128" y2="${y + 16}" stroke-width="0"/>`;
  })
  .join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b1020"/>
      <stop offset="55%" stop-color="#111a33"/>
      <stop offset="100%" stop-color="#1b2a52"/>
    </linearGradient>
    <radialGradient id="glow" cx="78%" cy="18%" r="60%">
      <stop offset="0%" stop-color="#2f7bff" stop-opacity="0.42"/>
      <stop offset="100%" stop-color="#2f7bff" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#4f9cff"/>
      <stop offset="100%" stop-color="#8b5cf6"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>

  <rect x="0" y="0" width="${W}" height="6" fill="url(#accent)"/>

  <text x="72" y="128" font-family="DejaVu Sans, sans-serif" font-size="30" font-weight="bold" fill="#6f8ec9" letter-spacing="4">ZENLESS ZONE ZERO</text>

  <text x="72" y="212" font-family="DejaVu Sans, sans-serif" font-size="74" font-weight="bold" fill="#ffffff">ZZZ 3.3 Countdown</text>
  <text x="72" y="262" font-family="DejaVu Sans, sans-serif" font-size="32" fill="#b9c8e6">Version 3.3 &#8220;Journey to the Sky&#8221; &#183; live timers</text>

  <g>
    <rect x="72" y="292" width="232" height="44" rx="22" fill="#4f9cff" fill-opacity="0.16" stroke="#4f9cff" stroke-opacity="0.55"/>
    <circle cx="100" cy="314" r="7" fill="#5ee08a"/>
    <text x="120" y="322" font-family="DejaVu Sans, sans-serif" font-size="21" fill="#cfe0ff">Version is live</text>
  </g>

  <text x="72" y="374" font-family="DejaVu Sans, sans-serif" font-size="21" fill="#7d8db0">Every date below is taken from the official HoYoverse announcement.</text>

  <g>
    ${rowMarkup}
  </g>

  <text x="72" y="${H - 30}" font-family="DejaVu Sans, sans-serif" font-size="21" fill="#66779b">zzzcountdown.site &#183; independent fan site, not affiliated with HoYoverse</text>

  <g transform="translate(1010, 92)">
    <circle cx="64" cy="64" r="60" fill="none" stroke="#2c3d63" stroke-width="8"/>
    <circle cx="64" cy="64" r="60" fill="none" stroke="#4f9cff" stroke-width="8" stroke-linecap="round"
            stroke-dasharray="301 377" transform="rotate(-90 64 64)"/>
    <text x="64" y="76" text-anchor="middle" font-family="DejaVu Sans, sans-serif" font-size="46" font-weight="bold" fill="#ffffff">3.3</text>
  </g>
</svg>`;

await mkdir(outDir, { recursive: true });
await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(outFile);
await writeFile(resolve(outDir, 'og-zzz-3-3.svg'), svg, 'utf8');

console.log(`[og-image] written ${outFile}`);
