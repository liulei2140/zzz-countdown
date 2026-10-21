#!/usr/bin/env node
/**
 * Rasterise the favicon SVG into the PNG/ICO files browsers ask for.
 *
 * `src/assets/favicons/favicon.svg` is the single source of truth: a vector
 * mark (dark plate, orange countdown ring, cut white Z). Browsers that support
 * SVG icons load that file directly; everything else falls back to a PNG, and
 * legacy browsers to an ICO holding 16/32/48 px frames.
 *
 * The apple-touch icon is rendered from a square variant — iOS applies its own
 * mask, so a transparent rounded corner would show up as a hole.
 *
 * Run: node scripts/build-favicons.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dir = resolve(root, 'src/assets/favicons');
const svgPath = resolve(dir, 'favicon.svg');

const svg = readFileSync(svgPath, 'utf8');
/** Same artwork, square plate: iOS rounds the apple-touch icon itself. */
const squareSvg = svg.replace(/rx="14"/g, 'rx="0"');

/**
 * Wrap PNG frames in an ICO container. ICO entries may hold PNG payloads
 * directly, which keeps this dependency-free.
 */
function buildIco(frames) {
  const count = frames.length;
  const header = Buffer.alloc(6 + 16 * count);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(count, 4);

  let offset = header.length;
  frames.forEach((frame, i) => {
    const at = 6 + 16 * i;
    header.writeUInt8(frame.size >= 256 ? 0 : frame.size, at);
    header.writeUInt8(frame.size >= 256 ? 0 : frame.size, at + 1);
    header.writeUInt8(0, at + 2);
    header.writeUInt8(0, at + 3);
    header.writeUInt16LE(1, at + 4);
    header.writeUInt16LE(32, at + 6);
    header.writeUInt32LE(frame.data.length, at + 8);
    header.writeUInt32LE(offset, at + 12);
    offset += frame.data.length;
  });

  return Buffer.concat([header, ...frames.map((frame) => frame.data)]);
}

const targets = [
  { file: 'icon-32.png', size: 32, square: false },
  { file: 'icon-192.png', size: 192, square: false },
  { file: 'icon-512.png', size: 512, square: false },
  { file: 'apple-touch-icon.png', size: 180, square: true },
];

for (const target of targets) {
  const source = target.square ? squareSvg : svg;
  const png = await sharp(Buffer.from(source), { density: 600 })
    .resize(target.size, target.size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  writeFileSync(resolve(dir, target.file), png);
  console.log(`[build-favicons] ${target.file} (${target.size}x${target.size}, ${png.length} bytes)`);
}

const frames = [];
for (const size of [16, 32, 48]) {
  const data = await sharp(Buffer.from(svg), { density: 600 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer();
  frames.push({ size, data });
}

const ico = buildIco(frames);
// Into `public/`, so it is served verbatim at /favicon.ico — the path
// browsers probe on their own, without Astro having to process it.
writeFileSync(resolve(root, 'public/favicon.ico'), ico);
console.log(`[build-favicons] public/favicon.ico (16/32/48, ${ico.length} bytes)`);
