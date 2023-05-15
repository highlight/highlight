sed -i '/use client/d' dist/HighlightInit.mjs
sed -i '2s/^/"use client";\n/' dist/HighlightInit.mjs

sed -i '/use client/d' dist/HighlightInit.js
sed -i '2s/^/"use client";\n/' dist/HighlightInit.js