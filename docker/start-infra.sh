#!/bin/bash -ex

source env.sh

# startup the infra

SERVICES="clickhouse kafka postgres redis zookeeper collector"

BASE_COMPOSE="./compose.yml"
COLLECTOR_CONFIG="./collector.yml"
if [[ "$IN_DOCKER_GO" == "true" ]]; then
  if grep -q '*highlight-logging' "$BASE_COMPOSE"; then
    sed -i "s/\*highlight-logging/\*local-logging/g" $BASE_COMPOSE
  fi
  if grep -q 'https://host.docker.internal' "$COLLECTOR_CONFIG"; then
    sed -i "s/https:\/\/host\.docker\.internal:8082/http:\/\/backend:8082/g" $COLLECTOR_CONFIG
  fi
  if grep -q 'insecure_skip_verify' "$COLLECTOR_CONFIG"; then
    sed -i "18d;19d" $COLLECTOR_CONFIG
  fi
elif [[ "$SSL" != "true" ]]; then
  if grep -q 'https://host.docker.internal' "$COLLECTOR_CONFIG"; then
    sed -i "s/https:\/\/host\.docker/http:\/\/host\.docker/g" $COLLECTOR_CONFIG
  fi
  if grep -q 'insecure_skip_verify' "$COLLECTOR_CONFIG"; then
    sed -i "18d;19d" $COLLECTOR_CONFIG
  fi
fi

docker compose pull $SERVICES
docker compose up --detach --wait --remove-orphans $SERVICES

if [[ "$*" != *"--go-docker"* ]]; then
  pushd ../backend
  # migrate postgres schema
  go run ./migrations/main.go > /tmp/highlightSetup.log 2>&1
  if grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log; then
    echo 'Failed to migrate highlight infrastructure.'
    grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log
    echo 'Full output.'
    cat /tmp/highlightSetup.log
    exit 1
  fi
  popd
fi
echo 'Highlight infrastructure started'
