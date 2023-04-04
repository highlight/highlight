#!/bin/bash -ex

source env.sh

# start backend
pushd ../backend
go install github.com/cosmtrek/air@latest
go install github.com/go-delve/delve/cmd/dlv@latest
make start-no-doppler
popd
