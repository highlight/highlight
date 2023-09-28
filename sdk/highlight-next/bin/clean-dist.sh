sed -i '' '/"use client";/d' dist/next-client.js
sed -i '' '/"use client";/d' dist/next-client.cjs

printf '%s \n%s' '"use client";' "$(cat dist/next-client.js)" > dist/next-client.js
printf '%s \n%s' '"use client";' "$(cat dist/next-client.cjs)" > dist/next-client.cjs
