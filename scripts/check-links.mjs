#!/usr/bin/env node
/**
 * Internal link check for the built site.
 *
 * Astro writes every route as a directory index (`dist/banners/index.html`),
 * while the pages link to the extensionless form (`/banners`). Both are served
 * by Cloudflare Pages, so the check normalises the trailing slash before
 * comparing.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = 'dist';

const walk = (dir, acc = []) => {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (p.endsWith('.html')) acc.push(p);
  }
  return acc;
};

/** Every route is compared with exactly one trailing slash. */
const norm = (route) => route.replace(/\/+$/, '') + '/';

const pages = walk(root);
const routes = new Set(
  pages.map((p) =>
    norm(
      '/' +
        p
          .replace(/^dist\//, '')
          .replace(/index\.html$/, '')
          .replace(/\.html$/, '/')
    )
  )
);

const broken = [];
for (const p of pages) {
  const html = readFileSync(p, 'utf8');
  for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) {
    const href = m[1];
    if (href.startsWith('//') || /\.[a-z0-9]{2,5}$/i.test(href)) continue;
    if (!routes.has(norm(href))) broken.push(`${p.replace(/^dist\//, '')} -> ${href}`);
  }
}

if (broken.length) {
  for (const b of broken) console.log('BROKEN ' + b);
  console.log(`${broken.length} broken internal links`);
  process.exit(1);
}
console.log(`OK: all internal links resolve (${routes.size} routes, ${pages.length} pages)`);
