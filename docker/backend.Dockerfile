FROM golang:bullseye as backend-builder
RUN apt update && apt install -y git build-essential && apt clean
WORKDIR /build
COPY ../go.work .
COPY ../go.work.sum .
COPY ../backend ./backend
COPY ../sdk/highlight-go ./sdk/highlight-go
RUN go work sync

WORKDIR /build/backend
RUN go mod download
RUN GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o /bin/backend

CMD ["/bin/backend"]
