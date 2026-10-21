# ZZZ Countdown · site

Static site for the `zzz 3.3 countdown` keyword, built on
[AstroWind](https://github.com/arthelokyo/astrowind) (Astro 7 + Tailwind CSS v4).

The site answers one question per page, with every date traceable to an
official HoYoverse announcement.

| Page                                                  | Task                                                                                             | Primary keyword                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `/`                                                   | Live countdown to the version launch, the Phase I switch, the Phase II switch and the end of 3.3 | `zzz 3.3 countdown`                   |
| `/release-time`                                       | The same moments in 14 time zones, with the daylight saving offsets in force on the day          | `zzz 3.3 release time in my timezone` |
| `/banners`                                            | Every 3.3 Signal Search channel with its own live timer                                          | `zzz 3.3 banners phase 2`             |
| `/pre-download`                                       | File sizes per platform, the download window and the compensation conditions                     | `zzz 3.3 pre-download size`           |
| `/whats-new`                                          | The update announcement written out: Agents, W-Engines, mech combat, events, areas, store        | `zzz 3.3 new content`                 |
| `/versions`                                           | Version start and end dates, the 42-day cadence, the next version                                | `zzz version history`                 |
| `/sources`                                            | Every announcement, what it confirms, what is an estimate, and the verification log              | —                                     |
| `/about`, `/contact`, `/privacy`, `/editorial-policy` | Station pages                                                                                    | —                                     |

## Commands

```bash
npm install
npm run dev       # local dev server on :4321
npm run build     # og image -> site URL -> astro build  (output: dist/)
npm run preview   # serve the built site
npm run verify    # DOM test of the built countdown behaviour + density + link checks
```

`npm run build` runs four steps in order:

1. `npm run og` regenerates the Open Graph card (`src/assets/images/og-zzz-3-3.png`) from `scripts/og-image.mjs`.
2. `node scripts/set-site-url.mjs` rewrites the `site:` field in `src/config.yaml` from the `SITE_URL` environment variable. Without it the placeholder domain is kept.
3. `npm run favicons` rasterises `src/assets/favicons/favicon.svg` into the PNG and ICO fallbacks.
4. `astro build` produces the static site in `dist/`.

```bash
SITE_URL=https://your-domain.example npm run build
```

## Site icon and sitemap

`src/assets/favicons/favicon.svg` is the site icon: a dark plate, an orange
countdown ring and a cut white Z. It is the only hand-authored file in that
folder — `scripts/build-favicons.mjs` renders it into `icon-32.png`,
`icon-192.png`, `icon-512.png`, `apple-touch-icon.png` (square, because iOS
applies its own mask) and `public/favicon.ico`. Those outputs are generated on
every build and are not tracked in git.

`@astrojs/sitemap` writes a sharded index (`sitemap-index.xml` plus
`sitemap-0.xml`). `src/integrations/sitemap-alias.ts` merges the shards into a
plain `/sitemap.xml` as well and points `robots.txt` at it, so the path people
and tooling try first resolves instead of returning 404. `npm run verify`
asserts that the alias and the shard list the same URLs.

## How the countdown works

`src/data/zzz.ts` is the single source of truth. Every timestamp is an absolute
ISO 8601 instant with the `+08:00` offset HoYoverse uses, and every entry
carries the id of the announcement it came from.

`src/components/common/CountdownScript.astro` registers the `zzz-countdown`
custom element:

- targets are read from `data-target` on `[data-zzz-timer]` elements;
- the status strip follows the official schedule (pre-download → maintenance → live → ended);
- remaining time is computed from absolute instants, so daylight saving cannot shift the answer;
- the visitor's local time is derived with `Intl`, never by adding a fixed offset;
- every timer also renders a server-side text fallback, so the page is readable without JavaScript.

`npm run verify` loads the built HTML into a DOM, freezes the clock at
2026-10-21 18:00 (UTC+8) and asserts the rendered values — the launch timer
reads “reached”, the Phase I timer reads 20d 17h 59m, the status reads
“Version 3.3 is live”, and the eight banner timers on `/banners` each show
their own countdown.

It also guards the layout, so the site cannot quietly drift back into a wall of
text:

- **word budget** — every page has a ceiling on its visible word count;
- **artwork** — every content page must render at least one image;
- **`/whats-new` grid** — the “The dates behind this update” block must be three
  cards in a three-column grid, so it can never leave half a row empty;
- **sitemap** — `/sitemap.xml` must exist and list exactly the URLs the sharded
  sitemap lists, and `robots.txt` must advertise it;
- **site icon** — the SVG icon in the build must be the countdown mark, with the
  PNG and ICO fallbacks present, so the template’s clock can never come back;
- **internal links** — `scripts/check-links.mjs` walks `dist/` and fails on any
  link that does not resolve to a built route.

## Artwork

The game artwork is HoYoverse's own material, taken from the announcements
already listed on `/sources` (the 3.3 update announcement, the Phase I channel
notice, the Pre-Download notice and the Special Program Intel Report). It lives
in `src/assets/images/official/` and is credited in the footer, on `/about` and
on `/sources`. The remaining images under `src/assets/images/` are original
artwork made for this site, used on the pages the publisher has no equivalent
art for.

`SectionArt.astro` renders a captioned full-width band; `PhaseTimeline.astro`
draws the version cycle to scale with a live “you are here” marker.

## Per-version routine

The site is rebuilt for every version (roughly every six weeks):

1. Update `src/data/zzz.ts`: milestones, banner channels, pre-download sizes, store items, FAQ.
2. Update the copy in `src/pages/*.astro` for the new version.
3. Regenerate the OG card (`npm run og`) — it carries the four headline dates.
4. Run `npm run build && npm run verify`.
5. Move the previous version to an archive page when the next version is announced.

## Deployment to Cloudflare Pages

The site is live at <https://zzzcountdown.space> (project `zzz-countdown`,
production branch `main`).

Deploy from a local machine:

```bash
SITE_URL=https://zzzcountdown.space npm run build
npx wrangler pages deploy dist --project-name=zzz-countdown --branch=main
```

Deploy from GitHub Actions: `.github/workflows/ci.yml` builds, checks and
verifies on every push, then deploys to Cloudflare Pages. The deploy job needs
two repository secrets:

| Secret                  | Value                                                                                                                      |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `CLOUDFLARE_ACCOUNT_ID` | `f347ea77ea0eb80226457a78b20baf3a`                                                                                         |
| `CLOUDFLARE_API_TOKEN`  | a token created in the Cloudflare dashboard with **Cloudflare Pages: Edit** and **Workers Scripts: Edit** for this account |

Until the token is added, the deploy job is skipped and the check job reports
it in the run summary — the build itself is unaffected.

```bash
gh secret set CLOUDFLARE_API_TOKEN --repo liulei2140/zzz-countdown
gh secret set CLOUDFLARE_ACCOUNT_ID --repo liulei2140/zzz-countdown --body f347ea77ea0eb80226457a78b20baf3a
```

## Custom domain

The canonical host is `zzzcountdown.space`. The zone is hosted on Cloudflare
(the registrar stays Spaceship; only the name servers moved), and the Pages
project `zzz-countdown` has both `zzzcountdown.space` and
`www.zzzcountdown.space` attached as custom domains.

| Where                 | Record                                                        |
| --------------------- | ------------------------------------------------------------- |
| Cloudflare DNS        | `CNAME @` → `zzz-countdown.pages.dev` (proxied)               |
| Cloudflare DNS        | `CNAME www` → `zzz-countdown.pages.dev` (proxied)             |
| Registrar (Spaceship) | NS → `desiree.ns.cloudflare.com`, `quinton.ns.cloudflare.com` |

Cloudflare flattens the apex CNAME, so the root domain resolves without an A
record.

Everything on the site derives from one switch. `SITE_URL` rewrites the `site:`
field in `src/config.yaml`, and the canonical link, Open Graph URL, sitemap,
`robots.txt` and the Open Graph card all follow it — nothing else names the
host. `npm run verify` asserts that those five agree with each other and that
no host from an earlier domain is left behind.

The Pages host `zzz-countdown.pages.dev` stays reachable as a fallback, but it
redirects to the canonical host. `scripts/write-redirects.mjs` writes
`public/_redirects` on every build, because the right rules depend on which
host is canonical:

```
https://zzz-countdown.pages.dev/* https://zzzcountdown.space/:splat 301
https://www.zzzcountdown.space/* https://zzzcountdown.space/:splat 301
```

The apex is deliberately not in that list — redirecting the canonical host to
itself would be a loop. While the custom domain is still being pointed at
Cloudflare and the canonical host is still the Pages host, the script writes
no rules at all, because a redirect to a host that does not resolve yet would
send every visitor nowhere. `npm run verify` checks the rules against the
built site.

## Analytics

Google Analytics 4 runs with the measurement ID `G-6S85YYNPTX`. The ID comes
from the build environment — `PUBLIC_GA_ID` — so it can be changed without
editing a tracked file:

| Where     | How                                                                           |
| --------- | ----------------------------------------------------------------------------- |
| Local     | `PUBLIC_GA_ID=...` in `.env` (not tracked)                                    |
| CI        | the `PUBLIC_GA_ID` repository variable                                        |
| Component | `src/components/common/Analytics.astro` loads the tag only when the ID is set |

`/privacy` names the provider, what it measures, the `_ga` cookie and its
retention, and an opt-out link. `npm run verify` fails if the tag and the
disclosure disagree.

## Notes

- The site is an independent fan project and is not affiliated with HoYoverse.
- The go-live minute is an estimate (official maintenance start + “about five hours”); the pages label it as such.
- `src/config.yaml` holds the canonical host. It is rewritten on every build from `SITE_URL`
  (the environment variable wins; `.env` is the fallback).
