#!/bin/bash -ex

brotliFolder=".brotli"

./telemetry.sh
source env.sh

# start backend
pushd ../backend
go install github.com/cosmtrek/air@latest
go install github.com/go-delve/delve/cmd/dlv@latest


if [ ! /usr/local/bin/brotli ]; then
    rm -rf $brotliFolder
    git clone https://github.com/google/brotli $brotliFolder
    cd $brotliFolder
    mkdir out
    cd out
    cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr/local -DSHARE_INSTALL_PREFIX=/usr/local/share ..
    cmake --build . --config Release --target install
    cd ../..
fi

make start-no-doppler
popd
