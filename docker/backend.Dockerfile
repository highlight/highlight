FROM --platform=$BUILDPLATFORM golang:bullseye as backend-base

LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

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
WORKDIR /build
COPY --from=backend-base /build/backend /build
COPY --from=backend-base /highlight/backend/localhostssl/ /build
COPY --from=backend-base /highlight/backend/clickhouse/migrations/ /build/clickhouse

CMD ["/build/backend", "-runtime=private-graph"]
