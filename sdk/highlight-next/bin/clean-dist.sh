printf '%s%s' '"use client";' "$(cat dist/next-client.js)" > dist/next-client.js
printf '%s%s' '"use client";' "$(cat dist/next-client.cjs)" > dist/next-client.cjs
