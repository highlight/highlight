#!/bin/bash -ex

TARGET="${TARGET:-backend}"

GIT_SHA=$(git rev-parse HEAD)
PUSH="${PUSH:--t ghcr.io/highlight/highlight-$TARGET:latest}"
REACT_APP_COMMIT_SHA="${REACT_APP_COMMIT_SHA:-$GIT_SHA}"
RELEASE="${RELEASE:-$GIT_SHA}"

ANNOTATIONS="annotation-index.org.opencontainers.image.description=highlight.io production ${TARGET} image"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.source=https://github.com/highlight/highlight"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.licenses=Apache 2.0"

echo "Building $RELEASE:$REACT_APP_COMMIT_SHA:$GIT_SHA"

source env.sh --go-docker

pushd ..
docker buildx build $BUILD_ARGS \
  --build-arg REACT_APP_COMMIT_SHA=${REACT_APP_COMMIT_SHA} \
  $PUSH \
  $PLATFORM \
  -f docker/${TARGET}.Dockerfile \
  --target ${TARGET}-prod \
  --output "type=image,name=target,$ANNOTATIONS" .
