FROM golang:bullseye as backend-builder
RUN apt update && apt install -y git build-essential && apt clean
RUN mkdir /build
WORKDIR /build
COPY ../backend .
RUN go mod download
RUN --mount=type=secret,id=SENDGRID_API_KEY \
  --mount=type=secret,id=SLACK_CLIENT_ID \
  --mount=type=secret,id=SLACK_CLIENT_SECRET \
  export SENDGRID_API_KEY=$(cat /run/secrets/SENDGRID_API_KEY) && \
  export SLACK_CLIENT_ID=$(cat /run/secrets/SLACK_CLIENT_ID) && \
  export SLACK_CLIENT_SECRET=$(cat /run/secrets/SLACK_CLIENT_SECRET) && \
  GOOS=linux GOARCH=amd64 go build \
  -ldflags="-w -s -X main.SENDGRID_API_KEY=$SENDGRID_API_KEY -X github.com/highlight-run/highlight/backend/private-graph/graph.SLACK_CLIENT_ID=$SLACK_CLIENT_ID -X github.com/highlight-run/highlight/backend/private-graph/graph.SLACK_CLIENT_SECRET=$SLACK_CLIENT_SECRET" \
  -o /bin/backend

CMD ["make", "start"]
