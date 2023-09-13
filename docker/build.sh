# Get the short SHA of the current Git commit
short_sha=$(git rev-parse --short HEAD)

ANNOTATIONS="annotation-index.org.opencontainers.image.description=highlight.io production highlight-backend image"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.source=https://github.com/highlight/highlight"
ANNOTATIONS="$ANNOTATIONS,annotation-index.org.opencontainers.image.licenses=Apache 2.0"

if [ "release" == "release" ]; then
   push="--push -t thedevtron/highlight-backend:latest -t thedevtron/highlight-backend:$short_sha"
fi

# Build Docker image with common environment
(cd docker && source env.sh --go-docker)

docker buildx build $BUILD_ARGS \
   --no-cache --build-arg REACT_APP_COMMIT_SHA=15b7115 \
   $push \
   --platform linux/arm64,linux/amd64 \
   -f docker/backend.Dockerfile \
   --target backend-prod \
   --output "type=image,name=target,$ANNOTATIONS" . --builder mybuilder
