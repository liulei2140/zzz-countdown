import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';
import type { AstroIntegration } from 'astro';

/**
 * Publish a plain `/sitemap.xml` next to the sharded sitemap index.
 *
 * `@astrojs/sitemap` writes `sitemap-index.xml` plus one or more
 * `sitemap-N.xml` shards. That is valid markup, but `/sitemap.xml` is the
 * path people and SEO tooling try first, and a 404 there reads as
 * "this site has no sitemap at all".
 *
 * This merges every shard into a single `sitemap.xml` holding the same URLs,
 * so both paths resolve and list exactly the same pages. The index and the
 * shards stay in place — nothing is removed.
 */
export function sitemapAlias(): AstroIntegration {
  return {
    name: 'sitemap-alias',
    hooks: {
      'astro:build:done': ({ dir, logger }) => {
        const outDir = resolve(process.cwd(), dir.pathname);
        const indexPath = resolve(outDir, 'sitemap-index.xml');

        if (!existsSync(indexPath)) {
          logger.warn('[sitemap-alias] no sitemap-index.xml in the output, nothing to alias');
          return;
        }

        const index = readFileSync(indexPath, 'utf8');
        const shards = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)]
          .map((match) => basename(match[1]))
          .filter((name) => /^sitemap-[\w.-]+\.xml$/.test(name));

        const urls: string[] = [];
        let openTag = '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

        for (const shard of shards) {
          const shardPath = resolve(outDir, shard);
          if (!existsSync(shardPath)) continue;
          const xml = readFileSync(shardPath, 'utf8');
          const tag = xml.match(/<urlset[^>]*>/);
          if (tag && urls.length === 0) openTag = tag[0];
          urls.push(...[...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((match) => match[0]));
        }

        if (!urls.length) {
          logger.warn('[sitemap-alias] the sitemap shards hold no URLs, skipping the alias');
          return;
        }

        writeFileSync(
          resolve(outDir, 'sitemap.xml'),
          `<?xml version="1.0" encoding="UTF-8"?>${openTag}${urls.join('')}</urlset>`,
          'utf8'
        );
        logger.info(`[sitemap-alias] wrote sitemap.xml with ${urls.length} URLs`);

        // `public/robots.txt` ships without a sitemap line; point it at the
        // alias so crawlers get the same list the meta tag advertises.
        const robotsPath = resolve(outDir, 'robots.txt');
        if (!existsSync(robotsPath)) return;

        const firstLoc = index.match(/<loc>([^<]+)<\/loc>/)?.[1];
        if (!firstLoc) return;

        const origin = new URL(firstLoc).origin;
        const robots = readFileSync(robotsPath, 'utf8');
        const line = `Sitemap: ${origin}/sitemap.xml`;
        const next = /^Sitemap:.*$/m.test(robots)
          ? robots.replace(/^Sitemap:.*$/m, line)
          : `${robots.replace(/\s*$/, '')}\n\n${line}\n`;

        if (next !== robots) writeFileSync(robotsPath, next, 'utf8');
      },
    },
  };
}
