#!/bin/bash -ex

./telemetry.sh
source env.sh

# start backend
pushd ../backend
go install github.com/cosmtrek/air@latest
go install github.com/go-delve/delve/cmd/dlv@latest

git clone https://github.com/google/brotli
cd brotli
mkdir out
cd out
cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local ..
cmake --build . --config Release --target install

make start-no-doppler
popd
