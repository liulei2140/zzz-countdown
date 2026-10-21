# ZZZ Countdown — Agent Instructions

## What this repository is

The source of **ZZZ Countdown**, a static site that publishes Zenless Zone Zero
version release times, banner phase timers and pre-download details. It is
built on [AstroWind](https://github.com/arthelokyo/astrowind) (Astro 7 +
Tailwind CSS v4), which is MIT licensed — keep `LICENSE.md` and the attribution
in the README.

Live site: <https://zzz-countdown.pages.dev>

## The one rule that matters

**Every date on the site comes from an official HoYoverse announcement.**

- Put dates in `src/data/zzz.ts` only, as absolute ISO 8601 instants with the
  `+08:00` offset HoYoverse uses. Do not hard-code a date in a page.
- Give every entry the id of the announcement it came from so the page can link
  to the source.
- If a time is not printed in an official announcement, mark it
  `estimated: true` and say so on the page. The go-live minute is an estimate
  (maintenance start + "about five hours") and must never be presented as
  published.
- "Server time" in a ZZZ notice means UTC+8. Label it as such.

## Commands

```bash
npm install
npm run dev        # dev server
npm run build      # og image -> site url -> astro build -> dist/
npm run preview    # serve the built site
npm run verify     # DOM test of the built countdown behaviour
```

`SITE_URL=https://zzz-countdown.pages.dev npm run build` rewrites the canonical
host in `src/config.yaml` before building.

## Layout

| Path                                            | Purpose                                                                                                                             |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `src/data/zzz.ts`                               | The single source of truth: milestones, banner channels, pre-download data, time zones, FAQ copy, official sources                  |
| `src/components/common/CountdownScript.astro`   | The `zzz-countdown` custom element: timers, status machine, local time                                                              |
| `src/components/widgets/VersionCountdown.astro` | The four timers plus the status strip (home page)                                                                                   |
| `src/components/widgets/BannerCards.astro`      | Per-channel banner cards, each with its own timer                                                                                   |
| `src/components/widgets/KeyDates.astro`         | The milestone table with source links                                                                                               |
| `src/components/widgets/LocalTime.astro`        | A timestamp rendered in the visitor's own time zone                                                                                 |
| `src/components/widgets/SourceList.astro`       | The official announcements and what each confirms                                                                                   |
| `src/pages/*.astro`                             | One page per task: `/`, `/release-time`, `/banners`, `/pre-download`, `/whats-new`, `/versions`, `/sources`, plus the station pages |
| `src/navigation.ts`                             | Header and footer links                                                                                                             |
| `src/config.yaml`                               | Site name, canonical host, metadata, blog switch                                                                                    |
| `scripts/og-image.mjs`                          | Renders the 1200×628 social card from SVG                                                                                           |
| `scripts/set-site-url.mjs`                      | Rewrites the canonical host from `SITE_URL`                                                                                         |
| `scripts/verify-countdown.mjs`                  | Loads the built pages in a DOM, freezes the clock and asserts the rendered timers                                                   |

## Conventions

- One task per page. The home page takes the core keyword; the other pages take
  one specific question each. If two pages would answer the same question,
  merge them.
- Every page needs its own `title`, `description` and `H1`. The home page's
  title and H1 are intentionally different.
- Every time in the body links to the announcement it came from.
- The countdown component renders a server-side text fallback, so a page without
  JavaScript still states every target moment. Keep that fallback.
- Timers must compute from absolute instants. Never add a fixed offset to get a
  local time — derive it with `Intl`, so daylight saving cannot skew it.
- Run `npm run build && npm run verify` before pushing. The verify script checks
  the timer values, the status machine, the banner timers and the local-time
  rendering.

## Per-version routine

Zenless Zone Zero ships a version roughly every six weeks, and each one runs for
42 days. When a new version is announced:

1. Update `src/data/zzz.ts` with the new milestones, channels and sizes.
2. Rewrite the version-specific copy in `src/pages/*.astro`.
3. Regenerate the social card (`npm run og`) — it carries the four headline dates.
4. Run `npm run build && npm run verify`, then push; CI deploys to Cloudflare Pages.
5. When the following version is announced, move the current version to an
   archive page and point the home page at the new version.

## Deployment

- Cloudflare Pages, project `zzz-countdown`, production branch `main`.
- `.github/workflows/deploy.yml` builds and deploys on every push to `main`.
- It needs the repository secrets `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`.
- `public/_headers` sets the long cache headers for hashed assets.

## Notes

- The site is an independent fan project and is not affiliated with HoYoverse.
- The blog is disabled (`apps.blog.isEnabled: false` in `src/config.yaml`); the
  content collection was removed from `src/content.config.ts`. Do not add one
  back without a reason.
