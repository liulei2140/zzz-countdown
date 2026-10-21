#!/usr/bin/env bash
# Wait for the zzzcountdown.space DNS records to go live, then deploy.
#
# The domain is only usable once the zone actually resolves and Cloudflare
# Pages has issued a certificate for it. Until then the site stays on its
# current host, because a canonical link pointing at an unreachable address
# is worse than no change at all.
#
# Run: bash scripts/wait-and-deploy.sh
set -uo pipefail

SITE_DIR="/home/liulei/personal-knowledge/new-keywords/2026-10-21-zzz-3-3-countdown/site"
CANONICAL="https://zzzcountdown.space"
DEADLINE=$((SECONDS + 45 * 60))

cd "$SITE_DIR" || exit 1

echo "[wait] polling $CANONICAL every 20s (up to 45 minutes)"

while [ $SECONDS -lt $DEADLINE ]; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 12 "$CANONICAL/" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "[wait] $CANONICAL is serving 200 — deploying"

    npm run build >/tmp/deploy_build.log 2>&1 || {
      echo "[wait] build failed:"
      tail -20 /tmp/deploy_build.log
      exit 1
    }
    npm run verify >/tmp/deploy_verify.log 2>&1 || {
      echo "[wait] verify failed:"
      tail -30 /tmp/deploy_verify.log
      exit 1
    }

    npx wrangler pages deploy dist --project-name=zzz-countdown --branch=main \
      >/tmp/deploy_wrangler.log 2>&1 || {
      echo "[wait] wrangler deploy failed:"
      tail -20 /tmp/deploy_wrangler.log
      exit 1
    }

    echo "[wait] deployed. verifying the live site:"
    for path in / /banners /whats-new /sitemap.xml /robots.txt; do
      echo "[wait]   $path -> $(curl -s -o /dev/null -w '%{http_code}' -m 12 "$CANONICAL$path")"
    done
    echo "[wait]   canonical: $(curl -s -m 12 "$CANONICAL/" | grep -o 'rel="canonical"[^>]*' | head -1)"
    echo "[wait]   ga4: $(curl -s -m 12 "$CANONICAL/" | grep -o 'gtag/js?id=[A-Za-z0-9-]*' | head -1)"
    echo "[wait]   pages.dev -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' -m 12 'https://zzz-countdown.pages.dev/')"
    echo "[wait]   www -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' -m 12 'https://www.zzzcountdown.space/')"
    exit 0
  fi

  echo "[wait] $(date +%H:%M:%S) $CANONICAL -> ${code:-000}"
  sleep 20
done

echo "[wait] timed out after 45 minutes without the domain resolving"
exit 1
