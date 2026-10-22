#!/usr/bin/env bash
# Wait for www.zzzcountdown.space to answer, then report on the redirect.
#
# The canonical host is already live and deployed; this only waits for the
# optional www alias. A non-zero response means DNS and the certificate are
# in place. Whether it answers 301 (a Bulk Redirect to the apex) or 200 (the
# same content, with the canonical link pointing at the apex) both work —
# the redirect is the tidier form, but search engines merge either way
# because the canonical link is on the apex.
#
# Run: bash scripts/wait-for-www.sh
set -uo pipefail

WWW="https://www.zzzcountdown.space"
CANONICAL="https://zzzcountdown.space"
DEADLINE=$((SECONDS + 55 * 60))

echo "[wait] polling $WWW every 20s (up to 55 minutes)"

while [ $SECONDS -lt $DEADLINE ]; do
  code=$(curl -s -o /dev/null -w "%{http_code}" -m 12 "$WWW/" 2>/dev/null)
  if [ "$code" != "000" ] && [ -n "$code" ]; then
    echo "[wait] $WWW answers $code"
    echo "[wait]   redirect target: $(curl -s -o /dev/null -w '%{redirect_url}' -m 12 "$WWW/")"
    echo "[wait]   canonical on www: $(curl -sL -m 15 "$WWW/" | grep -o 'href="[^"]*" rel="canonical"' | head -1)"
    echo "[wait]   canonical host: $(curl -s -o /dev/null -w '%{http_code}' -m 12 "$CANONICAL/")"
    exit 0
  fi
  echo "[wait] $(date +%H:%M:%S) $WWW -> ${code:-000}"
  sleep 20
done

echo "[wait] timed out without $WWW resolving"
exit 1
