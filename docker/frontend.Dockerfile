FROM --platform=$BUILDPLATFORM node:lts-bullseye as frontend-base

RUN apt update && apt install -y build-essential chromium

WORKDIR /highlight
COPY .npmignore .prettierrc .prettierignore graphql.config.js tsconfig.json turbo.json .yarnrc.yml package.json yarn.lock ./
COPY ../.yarn/plugins ./.yarn/plugins
COPY ../.yarn/releases ./.yarn/releases
COPY ../backend/private-graph ./backend/private-graph
COPY ../backend/public-graph ./backend/public-graph
COPY ../backend/localhostssl ./backend/localhostssl
COPY ../docs-content ./docs-content
COPY ../frontend ./frontend
COPY ../highlight.io ./highlight.io
COPY ../packages ./packages
COPY ../render ./render
COPY ../rrweb ./rrweb
COPY ../scripts ./scripts
COPY ../sdk ./sdk
COPY ../sourcemap-uploader ./sourcemap-uploader
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
FROM --platform=$BUILDPLATFORM node:lts-alpine as frontend-prod
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Frontend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

RUN apk add --no-cache nginx
COPY ../docker/nginx.conf /etc/nginx/sites-enabled/default
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem

WORKDIR /build
COPY --from=frontend-base /highlight/frontend/build /build/frontend/build
COPY --from=frontend-base /highlight/sdk/client/dist /build/sdk/client/dist

CMD ["nginx", "-g", "daemon off;"]
