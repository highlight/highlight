FROM golang:bullseye as backend-base
RUN apt update && apt install -y git build-essential && apt clean
RUN go install github.com/go-delve/delve/cmd/dlv@latest
RUN go install github.com/cosmtrek/air@latest

WORKDIR /build
COPY ../go.work .
COPY ../go.work.sum .
COPY ../backend/go.mod ./backend/go.mod
COPY ../backend/go.sum ./backend/go.sum
COPY ../sdk/highlight-go/go.mod ./sdk/highlight-go/go.mod
COPY ../sdk/highlight-go/go.sum ./sdk/highlight-go/go.sum
COPY ../e2e/go/go.mod ./e2e/go/go.mod
COPY ../e2e/go/go.sum ./e2e/go/go.sum
RUN go work sync
RUN cd /build/backend && go mod download
RUN cd /build/e2e/go && go mod download
RUN cd /build/sdk/highlight-go && go mod download

FROM backend-base as backend
WORKDIR /build/backend
CMD ["make", "start-no-doppler"]

FROM backend-base as backend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Backend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

WORKDIR /build/backend
RUN GOOS=linux GOARCH=amd64 go build -o /bin/backend
CMD ["/bin/backend", "-runtime=private-graph"]
