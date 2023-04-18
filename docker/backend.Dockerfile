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
ARG BUILDARCH
RUN GOOS=linux GOARCH=$BUILDARCH go build -o /build/backend

# reduce the image size by keeping just the built code
FROM --platform=$BUILDPLATFORM golang:alpine as backend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add --no-cache doppler

WORKDIR /build
COPY --from=backend-base /build/backend /build
COPY --from=backend-base /highlight/backend/localhostssl/ /build/localhostssl
COPY --from=backend-base /highlight/backend/clickhouse/migrations/ /build/clickhouse/migrations

CMD ["/build/backend", "-runtime=all"]
