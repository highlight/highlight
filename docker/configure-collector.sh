#!/bin/sh -ex

COLLECTOR_CONFIG="./collector.yml"
if [[ "$IN_DOCKER_GO" == "true" ]]; then
  if [[ "$SSL" != "true" ]]; then
    if grep -q 'https://host.docker.internal' "$COLLECTOR_CONFIG"; then
      sed -i'' -e 's/https:\/\/host\.docker\.internal:8082/http:\/\/backend:8082/g' $COLLECTOR_CONFIG
    fi
    if grep -q 'insecure_skip_verify' "$COLLECTOR_CONFIG"; then
      sed -i'' -e '36d;37d' $COLLECTOR_CONFIG
    fi
  else
    if grep -q 'https://host.docker.internal' "$COLLECTOR_CONFIG"; then
      sed -i'' -e 's/https:\/\/host\.docker\.internal:8082/https:\/\/backend:8082/g' $COLLECTOR_CONFIG
    fi
  fi
elif [[ "$SSL" != "true" ]]; then
  if grep -q 'https://host.docker.internal' "$COLLECTOR_CONFIG"; then
    sed -i'' -e 's/https:\/\/host\.docker/http:\/\/host\.docker/g' $COLLECTOR_CONFIG
  fi
  if grep -q 'insecure_skip_verify' "$COLLECTOR_CONFIG"; then
    sed -i'' -e '36d;37d' $COLLECTOR_CONFIG
  fi
fi
