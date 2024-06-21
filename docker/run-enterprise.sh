#!/bin/bash -e

./telemetry.sh
source env.sh --go-docker

if [ -f "$ADMIN_PASSWORD" ]; then
  echo 'Exiting because no ADMIN_PASSWORD_FOUND'
  exit 1
fi

./start-infra.sh --go-docker

echo "Using images $BACKEND_IMAGE_NAME and $FRONTEND_IMAGE_NAME"
if [[ "$*" != *"--no-pull"* ]]; then
  docker compose -f compose.enterprise.yml pull
fi
if ! docker compose -f compose.enterprise.yml up --detach >>/tmp/highlightSetup.log 2>&1; then
  echo 'Failed to start highlight enterprise edition.'
  docker ps -a
  cat /tmp/highlightSetup.log
  exit 1
fi

echo "Highlight started on ${REACT_APP_FRONTEND_URI}"
wait
