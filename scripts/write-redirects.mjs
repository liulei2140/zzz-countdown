#!/usr/bin/env node
/**
 * Write `public/_redirects` for whichever host the site is being built for.
 *
 * The canonical host is `zzzcountdown.space`. While the domain is still
 * being pointed at Cloudflare, the site is served from the Pages host, and
 * the two states need opposite rules:
 *
 * - canonical host is the custom domain: send the Pages host and the www
 *   subdomain to it, and never to itself;
 * - canonical host is the Pages host (the transition period): there is
 *   nothing to redirect, because a redirect to the custom domain would
 *   point at a host that does not resolve yet.
 *
 * The file is generated so the rules can never contradict the canonical
 * host. `npm run verify` checks the result against the built site.
 *
 * Run: node scripts/write-redirects.mjs
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'public/_redirects');

const CUSTOM_DOMAIN = 'zzzcountdown.space';
const PAGES_HOST = 'zzz-countdown.pages.dev';

const config = await readFile(resolve(root, 'src/config.yaml'), 'utf8');
const configured = config.match(/^\s{2}site:\s*['"]?(https?:\/\/[^'"\n]+)/m)?.[1];
const host = configured ? new URL(configured).host : '';

if (host === CUSTOM_DOMAIN) {
  const rules = [
    `# Send the Pages host to the canonical host.`,
    `https://${PAGES_HOST}/* https://${CUSTOM_DOMAIN}/:splat 301`,
    `# Same for the www subdomain.`,
    `https://www.${CUSTOM_DOMAIN}/* https://${CUSTOM_DOMAIN}/:splat 301`,
    `# The canonical host is deliberately absent: redirecting it to itself`,
    `# would be a loop.`,
  ];
  await writeFile(outFile, `${rules.join('\n')}\n`, 'utf8');
  console.log(`[write-redirects] ${PAGES_HOST} and www -> ${CUSTOM_DOMAIN}`);
} else if (host === PAGES_HOST) {
  await writeFile(outFile, '', 'utf8');
  console.log(`[write-redirects] canonical host is ${PAGES_HOST}; no redirects written`);
} else {
  await writeFile(outFile, '', 'utf8');
  console.log(`[write-redirects] unknown canonical host "${host}"; no redirects written`);
}
