FROM golang:alpine as backend-builder
RUN apk update && apk add git
RUN mkdir /build-backend
WORKDIR /build-backend
COPY ./backend .
RUN go mod download
RUN --mount=type=secret,id=SENDGRID_API_KEY \
  export SENDGRID_API_KEY=$(cat /run/secrets/SENDGRID_API_KEY) && GOOS=linux GOARCH=amd64 \
  go build -ldflags="-w -s -X main.SENDGRID_API_KEY=$SENDGRID_API_KEY" -o /bin/backend

FROM node:14-alpine as frontend-builder
# These two 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG REACT_APP_COMMIT_SHA
ENV REACT_APP_ONPREM=true
RUN mkdir /build-frontend
WORKDIR /build-frontend
COPY ./frontend/package.json ./frontend/yarn.lock ./
RUN yarn install
COPY ./frontend ./
COPY ./.prettierrc ./
RUN CI=false yarn build

FROM alpine
ENV ONPREM_STATIC_FRONTEND_PATH="./build"
ENV ENABLE_OBJECT_STORAGE=true
ARG SLACK_CLIENT_ID_ARG
ENV SLACK_CLIENT_ID=$SLACK_CLIENT_ID_ARG
ARG SLACK_CLIENT_SECRET_ARG
ENV SLACK_CLIENT_SECRET=$SLACK_CLIENT_SECRET_ARG
WORKDIR /root/
COPY --from=backend-builder /bin/backend /bin/backend
RUN mkdir ./build
COPY --from=frontend-builder /build-frontend/build ./build

CMD ["/bin/backend"]
