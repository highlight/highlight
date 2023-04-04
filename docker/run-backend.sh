#!/bin/bash -ex

source env.sh

# start backend
pushd ../backend
go install github.com/cosmtrek/air@latest
make start-no-doppler
popd
