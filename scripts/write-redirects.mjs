#!/usr/bin/env node
/**
 * Write `public/_redirects`.
 *
 * Cloudflare Pages only supports *path-level* redirects in this file —
 * "Domain-level redirects" are explicitly listed as unsupported in the Pages
 * documentation, and a rule whose source is a full URL is silently ignored.
 * So this file deliberately holds no redirect rules.
 *
 * The two redirects this site actually wants are domain-level:
 *
 *   zzz-countdown.pages.dev/*  ->  zzzcountdown.space/*   (301)
 *   www.zzzcountdown.space/*   ->  zzzcountdown.space/*   (301)
 *
 * Those belong in Cloudflare's Bulk Redirects (zone level), which the
 * dashboard exposes under Rules -> Redirect Rules, or in the account-level
 * Bulk Redirects. They cannot be expressed here.
 *
 * The file is kept as a place for that note, and so the build always ships
 * one: a stale `_redirects` with domain rules in it would look like the
 * redirect was configured when it never was.
 *
 * Run: node scripts/write-redirects.mjs
 */
import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outFile = resolve(root, 'public/_redirects');

const contents = `# Cloudflare Pages does not support domain-level redirects in this file.
# The pages.dev host and the www subdomain are redirected to the canonical
# host in Cloudflare's Bulk Redirects instead (Rules -> Redirect Rules).
# Only path-level rules belong here; none are needed at the moment.
`;

await writeFile(outFile, contents, 'utf8');
console.log('[write-redirects] no path-level redirects needed');
