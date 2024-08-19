#!/bin/bash -e

./telemetry.sh
source env.sh

# setup session storage directory for local dev
export OBJECT_STORAGE_FS=/tmp/highlight-data
mkdir -p ${OBJECT_STORAGE_FS}

# start backend
pushd ../backend
go install github.com/air-verse/air@latest
go install github.com/go-delve/delve/cmd/dlv@latest
make start-no-doppler
popd
