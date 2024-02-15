#!/bin/bash -ex

./telemetry.sh
source env.sh --go-docker

if [ -f "$ADMIN_PASSWORD" ]; then
  echo 'Exiting because no ADMIN_PASSWORD_FOUND'
  exit 1
fi

./start-infra.sh --go-docker --hobby

docker compose -f compose.yml -f compose.hobby.yml pull
docker compose -f compose.yml -f compose.hobby.yml up --detach --remove-orphans
echo 'waiting for highlight hobby deploy to come online'
yarn dlx wait-on -l -s 3 http://localhost:8080/dist/index.js "${REACT_APP_FRONTEND_URI}"/index.html "${BACKEND_HEALTH_URI}"

echo "Highlight started on ${REACT_APP_FRONTEND_URI}"
wait
