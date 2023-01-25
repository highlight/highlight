#!/usr/bin/env bash

# build all images
docker compose build --pull

# startup the entire app
docker compose up -d
