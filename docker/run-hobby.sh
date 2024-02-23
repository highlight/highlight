#!/bin/bash -ex

./telemetry.sh
source env.sh --go-docker

if [ -f "$ADMIN_PASSWORD" ]; then
  echo 'Exiting because no ADMIN_PASSWORD_FOUND'
  exit 1
fi

./start-infra.sh --go-docker --hobby

docker compose -f compose.hobby.yml pull
if ! docker compose -f compose.hobby.yml up --detach backend frontend >>/tmp/highlightSetup.log 2>&1; then
  echo 'Failed to start highlight infrastructure.'
  cat /tmp/highlightSetup.log
  exit 1
fi

echo 'waiting for highlight hobby deploy to come online'
yarn dlx wait-on -l -s 2 "${REACT_APP_FRONTEND_URI}"/index.html "${BACKEND_HEALTH_URI}" || true

echo "Highlight started on ${REACT_APP_FRONTEND_URI}"
wait
