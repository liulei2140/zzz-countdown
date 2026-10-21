#!/usr/bin/env bash
# Point zzzcountdown.space at the Pages project and switch the site over.
#
# This does the whole custom-domain setup in one go:
#
#   1. creates the two CNAME records (apex and www) in the Cloudflare zone;
#   2. waits until the domain resolves;
#   3. rebuilds the site with zzzcountdown.space as the canonical host, so
#      the canonical link, the sitemap, robots.txt, the social card and the
#      redirect rules all follow;
#   4. deploys to Cloudflare Pages and checks what the live site answers.
#
# It needs an API token that can edit DNS in that zone:
#
#   Cloudflare Dashboard -> My Profile -> API Tokens -> Create Token ->
#   Custom Token. Permissions:
#     Zone / DNS / Edit          (zone: zzzcountdown.space)
#     Zone / Zone / Read         (zone: zzzcountdown.space)
#     Account / Cloudflare Pages / Edit
#
# Run:
#   CLOUDFLARE_API_TOKEN=xxxx bash scripts/setup-custom-domain.sh
#
# If you would rather add the records by hand, add these two in the
# dashboard and then run scripts/wait-and-deploy.sh instead:
#
#   CNAME  @     -> zzz-countdown.pages.dev   (proxied)
#   CNAME  www   -> zzz-countdown.pages.dev   (proxied)
set -uo pipefail

ZONE_NAME="zzzcountdown.space"
PAGES_TARGET="zzz-countdown.pages.dev"
CANONICAL="https://${ZONE_NAME}"
ACCOUNT_ID="f347ea77ea0eb80226457a78b20baf3a"
SITE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API="https://api.cloudflare.com/client/v4"

TOKEN="${CLOUDFLARE_API_TOKEN:-}"
if [ -z "$TOKEN" ]; then
  echo "CLOUDFLARE_API_TOKEN is not set."
  echo "See the header of this script for the token permissions, then re-run:"
  echo "  CLOUDFLARE_API_TOKEN=xxxx bash scripts/setup-custom-domain.sh"
  exit 1
fi

api() {
  curl -s -m 30 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" "$@"
}

echo "== 1. locating the zone =="
ZONE_ID=$(api "${API}/zones?name=${ZONE_NAME}" | python3 -c "
import json,sys
d=json.load(sys.stdin)
res=d.get('result') or []
print(res[0]['id'] if res else '')
")
if [ -z "$ZONE_ID" ]; then
  echo "   zone not found, or the token cannot read it"
  exit 1
fi
echo "   zone id: $ZONE_ID"

echo "== 2. writing the CNAME records =="
upsert_cname() {
  local name="$1"
  # Drop an existing record of the same name first, so re-running is safe.
  local ids
  ids=$(api "${API}/zones/${ZONE_ID}/dns_records?type=CNAME&name=${name}" | python3 -c "
import json,sys
d=json.load(sys.stdin)
print(' '.join(r['id'] for r in (d.get('result') or [])))
")
  for id in $ids; do
    api -X DELETE "${API}/zones/${ZONE_ID}/dns_records/${id}" >/dev/null
    echo "   removed the old CNAME ${name} (${id})"
  done
  local out
  out=$(api -X POST "${API}/zones/${ZONE_ID}/dns_records" \
    -d "{\"type\":\"CNAME\",\"name\":\"${name}\",\"content\":\"${PAGES_TARGET}\",\"proxied\":true,\"ttl\":1}")
  echo "$out" | python3 -c "
import json,sys
d=json.load(sys.stdin)
r=d.get('result') or {}
if d.get('success'):
    print('   created CNAME', r.get('name'), '->', r.get('content'), '(proxied)')
else:
    print('   FAILED:', d.get('errors'))
"
}

upsert_cname "$ZONE_NAME"
upsert_cname "www.${ZONE_NAME}"

echo "== 3. waiting for the domain to resolve =="
for i in $(seq 1 30); do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 12 "${CANONICAL}/" 2>/dev/null)
  if [ "$code" = "200" ]; then
    echo "   ${CANONICAL} is serving 200"
    break
  fi
  echo "   $(date +%H:%M:%S) ${CANONICAL} -> ${code:-000}"
  if [ "$i" = "30" ]; then
    echo "   gave up waiting — the records are in place but the host still does not answer."
    echo "   Check the Pages custom domain status before switching the site over."
    exit 1
  fi
  sleep 20
done

echo "== 4. building with ${CANONICAL} as the canonical host =="
cd "$SITE_DIR" || exit 1
SITE_URL="$CANONICAL" npm run build >/tmp/setup_build.log 2>&1 || {
  echo "   build failed:"
  tail -20 /tmp/setup_build.log
  exit 1
}
npm run verify >/tmp/setup_verify.log 2>&1 || {
  echo "   verify failed:"
  tail -30 /tmp/setup_verify.log
  exit 1
}
grep -E "canonical|robots.txt|sitemap.xml|redirects|GA4|site hosts" /tmp/setup_verify.log | sed 's/^/   /'

echo "== 5. deploying =="
npx wrangler pages deploy dist --project-name=zzz-countdown --branch=main \
  >/tmp/setup_wrangler.log 2>&1 || {
  echo "   deploy failed:"
  tail -20 /tmp/setup_wrangler.log
  exit 1
}

echo "== 6. checking the live site =="
for path in / /banners /whats-new /release-time /pre-download /sitemap.xml /robots.txt /favicon.ico; do
  echo "   ${path} -> $(curl -s -o /dev/null -w '%{http_code}' -m 15 "${CANONICAL}${path}")"
done
echo "   canonical: $(curl -s -m 15 "${CANONICAL}/" | grep -o 'href="[^"]*" rel="canonical"' | head -1)"
echo "   ga4: $(curl -s -m 15 "${CANONICAL}/" | grep -o 'gtag/js?id=[A-Za-z0-9-]*' | head -1)"
echo "   sitemap: $(curl -s -m 15 "${CANONICAL}/sitemap.xml" | grep -o '<loc>[^<]*</loc>' | head -1)"
echo "   pages.dev -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' -m 15 "https://${PAGES_TARGET}/")"
echo "   www -> $(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' -m 15 "https://www.${ZONE_NAME}/")"
echo
echo "Done. The site now answers on ${CANONICAL}."
