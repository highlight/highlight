#!/bin/bash -ex

echo 'Welcome to highlight.io!'
echo 'To know how folks are self-hosting highlight so that we can improve the product, we would like to report metrics about your usage.'
read -p "Is that ok? (Y/N): " confirm
if [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]]; then
  echo 'Thanks for helping improve the highlight open-source community!'
else
  if [ -f "../backend/.config/v1.json" ]; then
      jq '.phone_home_opt_out = true' ../backend/.config/v1.json > ../backend/.config/v2.json
      mv ../backend/.config/v2.json ../backend/.config/v1.json
  else
      cat '{"phone_home_opt_out": false}' > ../backend/.config/v1.json
  fi
  echo 'No worries. We have turned off internal telemetry.'
fi


source env.sh --go-docker
./start-infra.sh --go-docker --prod

docker compose -f compose.yml -f compose.prod.yml pull
docker compose -f compose.yml -f compose.prod.yml up --detach --remove-orphans
echo 'waiting for highlight hobby deploy to come online'
yarn dlx wait-on -l -s 3 https://localhost:3000/index.html http://localhost:8080/dist/index.js https://localhost:8082/health

echo 'Highlight started on https://localhost:3000'
wait
