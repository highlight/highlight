#!/bin/bash -ex

source env.sh --go-docker
./start-infra.sh --go-docker --prod

docker compose -f compose.yml -f compose.prod.yml pull
docker compose -f compose.yml -f compose.prod.yml up --pull missing --detach --wait --remove-orphans
echo 'waiting for highlight hobby deploy to come online'
yarn dlx wait-on -l -s 3 https://localhost:3000/index.html http://localhost:8080/dist/index.js https://localhost:8082/health

echo 'Highlight started on https://localhost:3000'
wait
