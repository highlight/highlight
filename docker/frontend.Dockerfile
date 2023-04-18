FROM --platform=$BUILDPLATFORM node:lts-alpine as frontend-build

RUN apk update && apk add --no-cache build-base chromium

WORKDIR /highlight
COPY . ./
RUN yarn

# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG NODE_OPTIONS="--max-old-space-size=16384 --openssl-legacy-provider"
ARG REACT_APP_AUTH_MODE
ARG REACT_APP_COMMIT_SHA
ARG REACT_APP_DEMO_SESSION
ARG REACT_APP_FIREBASE_CONFIG_OBJECT
ARG REACT_APP_FRONTEND_ORG
ARG REACT_APP_FRONTEND_URI
ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ARG TURBO_TOKEN
ARG TURBO_TEAM
RUN yarn build:frontend

# reduce the image size by keeping just the built code
FROM nginx:stable-alpine as frontend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Frontend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

COPY ../docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem

WORKDIR /build
COPY --from=frontend-build /highlight/frontend/build /build/frontend/build
COPY --from=frontend-build /highlight/sdk/client/dist /build/sdk/client/dist
