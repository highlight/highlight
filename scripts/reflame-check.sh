#!/bin/sh

set -e
yarn reflame-build --exclude-rrweb

if [ $(git ls-files -om --exclude-standard | wc -l) = 0 ]
then
  exit 0
fi

echo "Please run \`yarn reflame-build\` and commit the following updated files:"
git ls-files -om --exclude-standard
# Uncomment to debug by showing detailed diff 
# git diff
exit 1