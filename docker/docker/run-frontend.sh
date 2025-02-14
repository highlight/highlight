#!/bin/bash -e

source env.sh

# install frontend dependencies
yarn

# start frontend
yarn docker:frontend
