#!/bin/bash

if [ -f "../backend/.config/v1.json" ]; then
  hasOptOut=$(jq '.phone_home_opt_out' ../backend/.config/v1.json)
  if [[ $hasOptOut != *"null"* ]]; then
    exit 0
  fi
fi

echo 'Welcome to highlight.io!'
echo 'To know how folks are self-hosting highlight so that we can improve the product, we would like to report metrics about your usage.'
read -p "Is that ok? (Y/N): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  if [ -f "../backend/.config/v1.json" ]; then
    jq '.phone_home_opt_out = false' ../backend/.config/v1.json >../backend/.config/v2.json
    mv ../backend/.config/v2.json ../backend/.config/v1.json
  else
    echo '{"phone_home_opt_out": false}' >../backend/.config/v1.json
  fi
  echo 'Thanks for helping improve the highlight open-source community!'
else
  if [ -f "../backend/.config/v1.json" ]; then
    jq '.phone_home_opt_out = true' ../backend/.config/v1.json >../backend/.config/v2.json
    mv ../backend/.config/v2.json ../backend/.config/v1.json
  else
    echo '{"phone_home_opt_out": true}' >../backend/.config/v1.json
  fi
  echo 'No worries. We have turned off internal telemetry.'
fi
