#!/bin/bash -ex

source env.sh

# install frontend dependencies
yarn

# start frontend
yarn docker:frontend
