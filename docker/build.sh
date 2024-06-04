#!/bin/bash -ex

TARGET="${TARGET:-backend}"
REACT_APP_COMMIT_SHA="${REACT_APP_COMMIT_SHA:-abc123}"
PUSH="${PUSH:--t ghcr.io/highlight/highlight-$TARGET:latest}"

ANNOTATIONS="annotation-index.org.opencontainers.image.description=highlight.io production ${TARGET} image"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.source=https://github.com/highlight/highlight"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.licenses=Apache 2.0"

source env.sh --go-docker

pushd ..
docker buildx build $BUILD_ARGS \
  --build-arg LICENSE_KEY=${LICENSE_KEY} \
  --build-arg REACT_APP_COMMIT_SHA=${REACT_APP_COMMIT_SHA} \
  $PUSH \
  $PLATFORM \
  -f docker/${TARGET}.Dockerfile \
  --target ${TARGET}-prod \
  --output "type=image,name=target,$ANNOTATIONS" .
