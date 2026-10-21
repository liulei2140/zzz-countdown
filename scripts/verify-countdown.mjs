#!/usr/bin/env node
/**
 * Verify the countdown behaviour of the built site.
 *
 * Each built page is loaded into a DOM, the clock is frozen at a known instant
 * and the rendered timer values, status text and local times are read back.
 * This exercises the code that actually ships, not a re-implementation of it.
 *
 * jsdom does not execute `type="module"` scripts, so the inline modules Astro
 * emits are evaluated here in document order; only the execution mechanism
 * differs from a browser.
 *
 * Run: node scripts/verify-countdown.mjs
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { JSDOM } from 'jsdom';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/** Frozen "now": 2026-10-21 18:00 UTC+8 (launch day, after the estimated go-live). */
const NOW = new Date('2026-10-21T10:00:00Z').getTime();

/** jsdom lacks these browser APIs; the template's own scripts need them. */
function stubEnvironment(window) {
  window.matchMedia =
    window.matchMedia ||
    (() => ({
      matches: false,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
    }));
  window.IntersectionObserver =
    window.IntersectionObserver ||
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };
  window.scrollTo = window.scrollTo || (() => {});
}

/**
 * Load a built page, run its scripts with a frozen clock and return what the
 * page rendered.
 */
function render(page, now = NOW) {
  let html = readFileSync(resolve(root, 'dist', page), 'utf8');
  // jsdom lacks matchMedia and IntersectionObserver, which the template's own
  // theme and reveal scripts expect. Stub them before the page parses.
  html = html.replace(
    '<head>',
    `<head><script>window.matchMedia=window.matchMedia||function(){return{matches:false,addEventListener(){},removeEventListener(){},addListener(){},removeListener(){}}};window.IntersectionObserver=window.IntersectionObserver||class{observe(){}unobserve(){}disconnect(){}takeRecords(){return[]}};window.scrollTo=window.scrollTo||function(){};</script>`
  );
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' });
  const { window } = dom;
  stubEnvironment(window);

  const RealDate = window.Date;
  class FrozenDate extends RealDate {
    constructor(...args) {
      if (args.length === 0) super(now);
      else super(...args);
    }
    static now() {
      return now;
    }
  }
  window.Date = FrozenDate;

  const errors = [];
  window.addEventListener('error', (e) => errors.push(String(e.error || e.message)));

  for (const script of window.document.querySelectorAll('script[type="module"]')) {
    try {
      window.eval(script.textContent);
    } catch (err) {
      errors.push(String(err));
    }
  }

  const doc = window.document;
  const result = {
    errors,
    timers: [...doc.querySelectorAll('[data-zzz-timer]')].map((card) => ({
      label: card.dataset.label,
      target: card.dataset.target,
      estimated: card.dataset.estimated,
      values: ['days', 'hours', 'minutes', 'seconds'].map((u) =>
        card.querySelector(`[data-unit="${u}"]`)?.textContent?.trim()
      ),
      state: card.querySelector('[data-timer-state]')?.textContent?.trim(),
      local: card.querySelector('[data-local-time]')?.textContent?.trim(),
    })),
    status: {
      title: doc.querySelector('[data-status-title]')?.textContent?.trim(),
      detail: doc.querySelector('[data-status-detail]')?.textContent?.trim(),
    },
    localTimes: [...doc.querySelectorAll('[data-local-time-iso]')].map((el) => el.textContent?.trim()),
  };

  window.close();
  return result;
}

const fail = [];
const expect = (cond, msg) => {
  if (!cond) fail.push(msg);
  return cond;
};

// --- home page ------------------------------------------------------------
const home = render('index.html');
console.log('=== home page (clock frozen at 2026-10-21 18:00 UTC+8) ===');
for (const t of home.timers) {
  console.log(`  ${t.label.padEnd(26)} ${t.values.join('/')}  ${t.state}`);
  console.log(`  ${''.padEnd(26)} target ${t.target} | local ${t.local}`);
}
console.log(`  status: ${home.status.title}`);

expect(home.errors.length === 0, `home page raised errors: ${home.errors.join('; ')}`);
expect(home.timers.length === 4, `expected 4 timers on the home page, found ${home.timers.length}`);

const byLabel = Object.fromEntries(home.timers.map((t) => [t.label, t]));

// The launch target is in the past at the frozen instant -> "reached".
const launch = byLabel['Version 3.3 goes live'];
expect(launch && launch.state?.includes('reached'), `launch timer should read as reached, got "${launch?.state}"`);
expect(launch?.values.join('') === '00000000', `launch timer should read 00, got ${launch?.values.join('/')}`);
expect(launch?.estimated === 'true', 'launch timer should be flagged as an estimate');

// Phase I ends 2026-11-11 11:59 +08:00; from 2026-10-21 10:00 UTC that is 20d 17h 59m.
const phase1 = byLabel['Phase I banners end'];
expect(
  phase1?.values.join('/') === '20/17/59/00',
  `phase 1 timer expected 20/17/59/00, got ${phase1?.values.join('/')}`
);
expect(phase1?.estimated === 'false', 'phase 1 timer should not be flagged as an estimate');
expect(
  phase1?.local && !phase1.local.includes('(UTC+8)'),
  `phase 1 timer should show a local time, got "${phase1?.local}"`
);

// The status machine must report the version as live on launch day.
expect(/live/i.test(home.status.title ?? ''), `status should report the version as live, got "${home.status.title}"`);

// --- banners page ---------------------------------------------------------
const banners = render('banners/index.html');
console.log('\n=== banners page ===');
for (const t of banners.timers) {
  console.log(`  ${String(t.label).padEnd(28)} ${t.values.join('/')}  ${t.state}`);
}
expect(banners.errors.length === 0, `banners page raised errors: ${banners.errors.join('; ')}`);
expect(banners.timers.length === 8, `expected 8 banner timers, found ${banners.timers.length}`);
const phoenix = banners.timers.find((t) => t.label === 'Phoenix banner ends');
expect(
  phoenix?.values.join('/') === '20/17/59/00',
  `Phoenix banner timer expected 20/17/59/00, got ${phoenix?.values.join('/')}`
);
const severian = banners.timers.find((t) => t.label === 'Severian banner ends');
expect(
  severian?.values.join('/') === '40/20/59/00',
  `Severian banner timer expected 40/20/59/00, got ${severian?.values.join('/')}`
);

// --- release-time page: the visitor's local time is rendered --------------
const release = render('release-time/index.html');
console.log('\n=== release-time page ===');
console.log(`  local times rendered: ${release.localTimes.length}`);
expect(release.errors.length === 0, `release-time page raised errors: ${release.errors.join('; ')}`);
expect(release.localTimes.length >= 2, `expected local time blocks, found ${release.localTimes.length}`);
for (const t of release.localTimes) {
  expect(!t.includes('(UTC+8)'), `local time should be replaced by the browser zone, got "${t}"`);
}

// --- a page without timers must still be clean -----------------------------
const about = render('about/index.html');
expect(about.errors.length === 0, `about page raised errors: ${about.errors.join('; ')}`);

// --- layout and density regressions ----------------------------------------
/**
 * Reads the built page without the site chrome and reports the visible word
 * count and the number of images. Used as a guard: pages must stay short and
 * must carry artwork, so the site cannot quietly drift back to a wall of text.
 */
function measure(page) {
  const html = readFileSync(resolve(root, 'dist', page), 'utf8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;
  doc.querySelectorAll('script,style,noscript,header,footer,nav').forEach((el) => el.remove());
  const text = (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim();
  return {
    words: text ? text.split(' ').length : 0,
    images: doc.querySelectorAll('img').length,
    doc,
  };
}

/** Pages that must carry at least one original image, and a word budget. */
const density = [
  { page: 'index.html', maxWords: 900, minImages: 7 },
  { page: 'banners/index.html', maxWords: 800, minImages: 9 },
  { page: 'release-time/index.html', maxWords: 760, minImages: 1 },
  { page: 'pre-download/index.html', maxWords: 760, minImages: 1 },
  { page: 'whats-new/index.html', maxWords: 800, minImages: 6 },
  { page: 'versions/index.html', maxWords: 340, minImages: 1 },
  { page: 'sources/index.html', maxWords: 560, minImages: 1 },
  { page: 'about/index.html', maxWords: 400, minImages: 1 },
  { page: 'contact/index.html', maxWords: 340, minImages: 1 },
  { page: 'privacy/index.html', maxWords: 300, minImages: 1 },
  { page: 'editorial-policy/index.html', maxWords: 430, minImages: 1 },
];

console.log('\n=== density ===');
for (const d of density) {
  const m = measure(d.page);
  console.log(`  ${d.page.padEnd(26)} ${String(m.words).padStart(4)} words  ${m.images} image(s)`);
  expect(m.words <= d.maxWords, `${d.page} has ${m.words} words, over the ${d.maxWords} budget`);
  expect(m.images >= d.minImages, `${d.page} has ${m.images} image(s), expected at least ${d.minImages}`);
}

// --- "The dates behind this update" must not leave a half-empty row ---------
{
  const { doc } = measure('whats-new/index.html');
  const heading = [...doc.querySelectorAll('h2')].find((h) => h.textContent?.includes('The dates behind this update'));
  expect(Boolean(heading), 'whats-new page is missing "The dates behind this update"');
  const section = heading?.closest('section');
  const grid = section?.querySelector('div[class*="grid"]');
  const cards = grid ? [...grid.children] : [];
  expect(Boolean(grid), 'the dates section has no grid to hold its cards');
  expect(
    grid?.className.includes('md:grid-cols-3'),
    `the dates section grid should use three columns, got "${grid?.className}"`
  );
  expect(cards.length === 3, `the dates section should have 3 cards, found ${cards.length}`);
  console.log(`  whats-new dates section: ${cards.length} cards in a 3-column grid`);
}

// --- sitemap ---------------------------------------------------------------
// `/sitemap.xml` is the path people and tooling try first. It must exist and
// list exactly the URLs the sharded sitemap index lists.
console.log('\n=== sitemap ===');
{
  const aliasPath = resolve(root, 'dist/sitemap.xml');
  expect(existsSync(aliasPath), 'dist/sitemap.xml is missing');

  if (existsSync(aliasPath)) {
    const alias = readFileSync(aliasPath, 'utf8');
    const aliasUrls = [...alias.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    const shard = readFileSync(resolve(root, 'dist/sitemap-0.xml'), 'utf8');
    const shardUrls = [...shard.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

    console.log(`  /sitemap.xml lists ${aliasUrls.length} URLs`);
    expect(
      aliasUrls.length === shardUrls.length,
      `sitemap.xml lists ${aliasUrls.length} URLs, the shard lists ${shardUrls.length}`
    );
    expect(aliasUrls.join('|') === shardUrls.join('|'), 'sitemap.xml and sitemap-0.xml list different URLs');
    for (const url of shardUrls) {
      expect(aliasUrls.includes(url), `sitemap.xml is missing ${url}`);
    }
    expect(
      shardUrls.some((url) => new URL(url).pathname === '/'),
      'sitemap.xml does not list the home page'
    );
    expect(
      alias.startsWith('<?xml') && alias.includes('<urlset') && alias.trim().endsWith('</urlset>'),
      'sitemap.xml is not a well-formed urlset document'
    );
  }

  // robots.txt must point crawlers at a sitemap that exists.
  const robots = readFileSync(resolve(root, 'dist/robots.txt'), 'utf8');
  const sitemapLine = robots.match(/^Sitemap:\s*(\S+)$/m)?.[1];
  console.log(`  robots.txt -> ${sitemapLine ?? '(no Sitemap line)'}`);
  expect(Boolean(sitemapLine), 'robots.txt has no Sitemap line');
  expect(sitemapLine?.endsWith('/sitemap.xml'), `robots.txt should advertise /sitemap.xml, got "${sitemapLine}"`);
}

// --- favicon ---------------------------------------------------------------
// The site icon must be the countdown mark, not the template's clock.
console.log('\n=== favicon ===');
{
  const home = readFileSync(resolve(root, 'dist/index.html'), 'utf8');
  // The HTML minifier reorders attributes, so match the tag, not a fixed
  // attribute sequence.
  const svgTag = home.match(/<link[^>]*type="image\/svg\+xml"[^>]*>/)?.[0];
  const svgHref = svgTag?.match(/href="([^"]+)"/)?.[1];
  console.log(`  svg icon: ${svgHref ?? '(missing)'}`);
  expect(Boolean(svgHref), 'the home page has no SVG favicon link');

  if (svgHref) {
    const svgPath = resolve(root, 'dist', svgHref.replace(/^\//, ''));
    expect(existsSync(svgPath), `the SVG favicon ${svgHref} is not in the build output`);
    if (existsSync(svgPath)) {
      const svg = readFileSync(svgPath, 'utf8');
      expect(
        svg.includes('stroke-dasharray') && svg.includes('url(#ring)'),
        'the SVG favicon is not the countdown mark (missing ring)'
      );
      expect(!/clock|#4f9cff/i.test(svg), 'the SVG favicon still looks like the template clock');
    }
  }

  for (const size of ['32x32', '192x192', '512x512']) {
    expect(home.includes(`sizes="${size}"`), `the home page has no ${size} PNG favicon fallback`);
  }
  expect(home.includes('rel="apple-touch-icon"'), 'the home page has no apple-touch icon');
  expect(/<meta[^>]*name="theme-color"[^>]*>/.test(home), 'the home page has no theme-color meta tag');
  expect(existsSync(resolve(root, 'dist/favicon.ico')), 'dist/favicon.ico is missing');
}

console.log('\n=== assertions ===');
if (fail.length) {
  for (const f of fail) console.log(`  FAIL: ${f}`);
  process.exit(1);
}
console.log('  all checks passed');
process.exit(0);
