FROM --platform=$BUILDPLATFORM golang:bullseye as backend-base
RUN apt update && apt install -y fish git build-essential && apt clean
RUN go install github.com/go-delve/delve/cmd/dlv@latest
RUN go install github.com/cosmtrek/air@latest

WORKDIR /highlight
COPY ../go.work .
COPY ../go.work.sum .
COPY ../backend/go.mod ./backend/go.mod
COPY ../backend/go.sum ./backend/go.sum
COPY ../sdk/highlight-go/go.mod ./sdk/highlight-go/go.mod
COPY ../sdk/highlight-go/go.sum ./sdk/highlight-go/go.sum
COPY ../e2e/go/go.mod ./e2e/go/go.mod
COPY ../e2e/go/go.sum ./e2e/go/go.sum
RUN go work sync
RUN cd /highlight/backend && go mod download
RUN cd /highlight/e2e/go && go mod download
RUN cd /highlight/sdk/highlight-go && go mod download

FROM backend-base as backend
WORKDIR /highlight/backend
CMD ["make", "start-no-doppler"]

FROM backend-base as backend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

COPY ../backend ./backend
COPY ../sdk/highlight-go ./sdk/highlight-go
COPY ../e2e/go ./e2e/go

WORKDIR /highlight/backend
ARG GOARCH
RUN GOOS=linux GOARCH=$GOARCH go build -o /build/backend

# reduce the image size by keeping just the built code
WORKDIR /build
RUN mkdir -p /build/clickhouse/ && cp -r /highlight/backend/clickhouse/migrations/ /build/clickhouse/migrations
RUN cp -r /highlight/backend/localhostssl/ /build/localhostssl
RUN rm -rf /highlight
RUN rm -rf /go/pkg && mkdir /go/pkg

CMD ["/build/backend", "-runtime=private-graph"]
