#!/bin/bash -ex

# setup env
$(cat .env | grep -vE '^#' | sed -e 's/^/export /')
export CLICKHOUSE_ADDRESS=localhost:9000
export INFLUXDB_SERVER=http://localhost:8086
export KAFKA_SERVERS=localhost:9092
export OPENSEARCH_DOMAIN=http://localhost:9200
export OPENSEARCH_DOMAIN_READ=http://localhost:9200
export PSQL_HOST=localhost
export REDIS_ADDRESS=localhost
export IN_DOCKER=true

# startup the infra
docker compose up --pull missing --build --detach --remove-orphans
pushd ../backend
# migrate postgres schema
go run ./migrations/main.go
# setup opensearch indices
go run main.go -runtime=worker -worker-handler=init-opensearch
popd
echo 'Highlight infrastructure started'

# install frontend dependencies
yarn

# start frontend & backend
yarn docker:frontend &
pushd ../backend
make start-no-doppler &
popd
echo 'waiting for highlight app to come online'
yarn dlx wait-on -l -s 3 https://localhost:3000/index.html http://localhost:8080/dist/index.js https://localhost:8082/health

echo 'Highlight started on https://localhost:3000'
wait
