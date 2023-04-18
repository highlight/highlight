FROM --platform=$BUILDPLATFORM golang:bullseye as backend-base

RUN apt update && apt install -y git build-essential
RUN go install github.com/go-delve/delve/cmd/dlv@latest
RUN go install github.com/cosmtrek/air@latest

WORKDIR /highlight
COPY ../go.work .
COPY ../go.work.sum .
COPY ../backend ./backend
COPY ../sdk/highlight-go ./sdk/highlight-go
COPY ../e2e/go ./e2e/go
RUN go work sync

WORKDIR /highlight/backend
ARG GOARCH
RUN GOOS=linux GOARCH=$GOARCH go build -o /build/backend

# reduce the image size by keeping just the built code
FROM --platform=$BUILDPLATFORM golang:bullseye as backend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

RUN apt-get update && apt-get install -y apt-transport-https ca-certificates curl gnupg && \
    curl -sLf --retry 3 --tlsv1.2 --proto "=https" 'https://packages.doppler.com/public/cli/gpg.DE2A7741A397C129.key' | apt-key add - && \
    echo "deb https://packages.doppler.com/public/cli/deb/debian any-version main" | tee /etc/apt/sources.list.d/doppler-cli.list && \
    apt-get update && apt-get install doppler && apt clean

WORKDIR /build
COPY --from=backend-base /build/backend /build
COPY --from=backend-base /highlight/backend/localhostssl/ /build/localhostssl
COPY --from=backend-base /highlight/backend/clickhouse/migrations/ /build/clickhouse/migrations

CMD ["/build/backend", "-runtime=private-graph"]
