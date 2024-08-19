---
'highlight.run': patch
---

revert postcss changes to css parsing in rrweb
https://github.com/rrweb-io/rrweb/pull/1458 introduced
a new CSS parser which causes issues with certain large CSS files
