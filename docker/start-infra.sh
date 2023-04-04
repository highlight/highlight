#!/bin/bash -ex

source env.sh

# startup the infra
docker compose up --pull missing --build --detach --remove-orphans
pushd ../backend
# migrate postgres schema
go run ./migrations/main.go
# setup opensearch indices
go run main.go -runtime=worker -worker-handler=init-opensearch
popd
echo 'Highlight infrastructure started'
