#!/usr/bin/env bash

# startup the entire app
doppler run -- docker compose up -d --build --remove-orphans

# configure influxdb
docker compose exec influxdb bash -c 'influx setup --skip-verify --bucket dev-bucket --org dev-org --username dev --password devdevdevdev --retention 0 --token not-a-secure-token --force'

# configure elasticsearch indexes
doppler run -- docker compose run backend bash -c '/bin/backend -runtime=worker -worker-handler=init-opensearch'
