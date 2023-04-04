#!/bin/bash -ex

source env.sh

# start backend
pushd ../backend
make start-no-doppler
popd
