#!/bin/bash -ex

source env.sh

# startup the infra

if [[ "$*" == *"--prod"* ]]; then
    CUSTOM_COMPOSE="-f compose.yml -f compose.prod.yml"
fi
docker compose $CUSTOM_COMPOSE up --pull missing --detach --wait --remove-orphans \
  clickhouse \
  collector \
  influxdb \
  kafka \
  opensearch \
  postgres \
  redis \
  zookeeper
if docker compose exec influxdb bash -c 'influx setup --host http://influxdb:8086 --skip-verify --bucket dev-bucket --org dev-org --username dev --password devdevdevdev --retention 0 --token not-a-secure-token --force' > /dev/null 2>&1; then
  echo 'Setup new InfluxDB instance.'
else
  echo 'InfluxDB already setup.'
fi

if [[ "$*" == *"--go-docker"* ]]; then
    exit 0
fi
pushd ../backend
# migrate postgres schema
go run ./migrations/main.go > /tmp/highlightSetup.log 2>&1
# setup opensearch indices
go run main.go -runtime=worker -worker-handler=init-opensearch >> /tmp/highlightSetup.log 2>&1
if grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log; then
  echo 'Failed to migrate highlight infrastructure.'
  grep -e 'OPENSEARCH_ERROR' /tmp/highlightSetup.log
  echo 'Full output.'
  cat /tmp/highlightSetup.log
  exit 1
fi
popd
echo 'Highlight infrastructure started'
