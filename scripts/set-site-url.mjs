#!/usr/bin/env node
/**
 * Set the canonical site URL before the build.
 *
 * `src/config.yaml` holds the placeholder domain. Deployments set SITE_URL
 * (for example `https://zzz-countdown.pages.dev`) and this script rewrites the
 * `site:` field, so canonical URLs, the sitemap and robots.txt point at the
 * real host without editing tracked files by hand.
 *
 * With no SITE_URL the file is left untouched.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = resolve(root, 'src/config.yaml');

/**
 * Reads `KEY=VALUE` pairs from a dotenv file. Astro loads the same files, so
 * a value set in `.env` means the same thing to the build and to this script.
 */
function readEnvFile(path) {
  if (!existsSync(path)) return {};
  const values = {};
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    let value = match[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[match[1]] = value;
  }
  return values;
}

const env = {
  ...readEnvFile(resolve(root, '.env')),
  ...readEnvFile(resolve(root, '.env.production')),
};

const siteUrl = process.env.SITE_URL?.trim() || env.SITE_URL?.trim();

if (!siteUrl) {
  console.log('[set-site-url] SITE_URL not set, keeping the domain in src/config.yaml');
  process.exit(0);
}

let normalized = siteUrl.replace(/\/+$/, '');
if (!/^https?:\/\//i.test(normalized)) {
  normalized = `https://${normalized}`;
}

const current = readFileSync(configPath, 'utf8');
// Target the nested `site:` key inside the top-level `site:` block, not the
// block header itself.
const next = current.replace(/^(\s{2}site:\s*)['"]?[^'"\n]*['"]?/m, `$1'${normalized}'`);

if (next === current) {
  console.log(`[set-site-url] domain already set to ${normalized}`);
} else {
  writeFileSync(configPath, next, 'utf8');
  console.log(`[set-site-url] domain set to ${normalized}`);
}
