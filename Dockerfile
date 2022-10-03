FROM golang:alpine as backend-builder
RUN apk update && apk add git build-base
RUN mkdir /build-backend
WORKDIR /build-backend
COPY ./backend .
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

FROM node:16-alpine as frontend-builder
# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG REACT_APP_COMMIT_SHA
ARG TURBO_TEAM
ENV REACT_APP_ONPREM=true
RUN mkdir /build-frontend
WORKDIR /build-frontend
COPY ./package.json ./yarn.lock ./turbo.json ./.yarnrc.yml ./
COPY ./.git ./.git
COPY ./.yarn ./.yarn
COPY ./client ./client
COPY ./firstload ./firstload
COPY ./frontend ./frontend
COPY ./rrweb ./rrweb
RUN --mount=type=secret,id=TURBO_TOKEN \
  export TURBO_TOKEN=$(cat /run/secrets/TURBO_TOKEN) && \
  export NODE_OPTIONS="--max-old-space-size=7168" && \
    yarn && yarn build:frontend

FROM alpine
RUN apk update && apk add build-base
ENV ONPREM_STATIC_FRONTEND_PATH="./build"
ENV ENABLE_OBJECT_STORAGE=true
WORKDIR /root/
COPY --from=backend-builder /bin/backend /bin/backend
RUN mkdir ./build
COPY --from=frontend-builder /build-frontend/frontend/build ./build

CMD ["/bin/backend"]
