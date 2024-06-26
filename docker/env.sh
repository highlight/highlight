#!/bin/bash -e

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)

# check for license key in env, override .env
if [[ "$LICENSE_KEY" != "" ]]; then
    echo "Using LICENSE_KEY from env."
    LICENSE_KEY_OVERRIDE=$LICENSE_KEY
fi

# setup env
$(cat .env | grep -vE '^#' | grep -E '\S+' | sed -e 's/^/export /')
export IN_DOCKER=true
export OBJECT_STORAGE_FS=/tmp/highlight-data
export REACT_APP_AUTH_MODE=password
export BACKEND_HEALTH_URI=$(echo "$REACT_APP_PUBLIC_GRAPH_URI" | sed -e 's/\/public/\/health/')
export LICENSE_KEY=$LICENSE_KEY_OVERRIDE

# if doppler is configured, use the doppler SSL value
DOPPLER_SSL=$(DOPPLER_CONFIG="" doppler secrets get SSL --plain || true)
if [[ "$DOPPLER_SSL" =~ ^(true|false)$ ]]; then
    export SSL=${DOPPLER_SSL}
    echo "Using doppler-set SSL value ${SSL}."
fi

if [[ "$*" == *"--go-docker"* ]]; then
    export CLICKHOUSE_ADDRESS=clickhouse:9000
    export IN_DOCKER_GO=true
    export KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://kafka:9092"
    export KAFKA_SERVERS=kafka:9092
    export ON_PREM=true
    export OTLP_DOGFOOD_ENDPOINT=https://otel.highlight.io:4318
    export OTLP_ENDPOINT=http://collector:4318
    export PSQL_HOST=postgres
    export REDIS_EVENTS_STAGING_ENDPOINT=redis:6379
    echo "Using docker-internal infra."
else
    export CLICKHOUSE_ADDRESS=localhost:9000
    export KAFKA_ADVERTISED_LISTENERS="PLAINTEXT://localhost:9092"
    export KAFKA_SERVERS=localhost:9092
    export OTLP_DOGFOOD_ENDPOINT=http://localhost:4318
    export OTLP_ENDPOINT=http://localhost:4318
    export PSQL_HOST=localhost
    export REDIS_EVENTS_STAGING_ENDPOINT=localhost:6379
fi
export BUILD_ARGS="--build-arg GOARCH=${GOARCH}
--build-arg REACT_APP_AUTH_MODE=${REACT_APP_AUTH_MODE}
--build-arg REACT_APP_COMMIT_SHA=${REACT_APP_COMMIT_SHA}
--build-arg REACT_APP_FRONTEND_ORG=${REACT_APP_FRONTEND_ORG}
--build-arg REACT_APP_FRONTEND_URI=${REACT_APP_FRONTEND_URI}
--build-arg REACT_APP_IN_DOCKER=${REACT_APP_IN_DOCKER}
--build-arg REACT_APP_PRIVATE_GRAPH_URI=${REACT_APP_PRIVATE_GRAPH_URI}
--build-arg REACT_APP_PUBLIC_GRAPH_URI=${REACT_APP_PUBLIC_GRAPH_URI}
--build-arg REACT_APP_FIREBASE_CONFIG_OBJECT=${REACT_APP_FIREBASE_CONFIG_OBJECT}
--build-arg REACT_APP_FRONT_INTEGRATION_CLIENT_ID=${REACT_APP_FRONT_INTEGRATION_CLIENT_ID}
--build-arg REACT_APP_STRIPE_API_PK=${REACT_APP_STRIPE_API_PK}
--build-arg REACT_APP_VERCEL_INTEGRATION_NAME=${REACT_APP_VERCEL_INTEGRATION_NAME}
--build-arg CLICKUP_CLIENT_ID=${CLICKUP_CLIENT_ID}
--build-arg DEMO_PROJECT_ID=${DEMO_PROJECT_ID}
--build-arg DISCORD_CLIENT_ID=${DISCORD_CLIENT_ID}
--build-arg GITHUB_CLIENT_ID=${GITHUB_CLIENT_ID}
--build-arg GITLAB_CLIENT_ID=${GITLAB_CLIENT_ID}
--build-arg HEIGHT_CLIENT_ID=${HEIGHT_CLIENT_ID}
--build-arg JIRA_CLIENT_ID=${JIRA_CLIENT_ID}
--build-arg LINEAR_CLIENT_ID=${LINEAR_CLIENT_ID}
--build-arg MICROSOFT_TEAMS_BOT_ID=${MICROSOFT_TEAMS_BOT_ID}
--build-arg SLACK_CLIENT_ID=${SLACK_CLIENT_ID}
--build-arg RELEASE=${RELEASE}
--build-arg TURBO_TOKEN=${TURBO_TOKEN}
--build-arg TURBO_TEAM=${TURBO_TEAM}
--build-arg ADMIN_PASSWORD=${ADMIN_PASSWORD}"

mkdir -p ${OBJECT_STORAGE_FS}

# setup path to include go installed binaries
export PATH=${PATH}:$(go env GOPATH)/bin

# setup ca cert for cypress testing
export NODE_EXTRA_CA_CERTS="${SCRIPT_DIR}/../backend/localhostssl/server.crt"

for port in 9092 5432 8123 9000 9200 8086 4317 4318; do
    if lsof -i tcp:$port | grep -v COMMAND | grep LISTEN | grep -v doc; then
        echo Port $port is already taken! Please ensure nothing is listening on that port.
        lsof -i tcp:$port
        exit 1
    fi
done
