FROM --platform=$BUILDPLATFORM golang:alpine as backend-build

RUN apk update && apk add --no-cache build-base

WORKDIR /highlight
COPY ../go.work .
COPY ../go.work.sum .
COPY ../backend ./backend
COPY ../sdk/highlight-go ./sdk/highlight-go
COPY ../sdk/highlight-grafana-datasource ./sdk/highlight-grafana-datasource
COPY ../e2e/go ./e2e/go
RUN go work sync

WORKDIR /highlight/backend
ARG TARGETARCH
ARG TARGETOS
RUN GOOS=$TARGETOS GOARCH=$TARGETARCH go build -o /build/backend

# reduce the image size by keeping just the built code
FROM golang:alpine as backend-prod
ARG REACT_APP_COMMIT_SHA
ENV REACT_APP_COMMIT_SHA=$REACT_APP_COMMIT_SHA
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk add --no-cache curl doppler

WORKDIR /build
COPY --from=backend-build /build/backend /build
COPY --from=backend-build /highlight/backend/localhostssl/ /build/localhostssl
COPY --from=backend-build /highlight/backend/clickhouse/migrations/ /build/clickhouse/migrations

CMD ["/build/backend", "-runtime=all"]
