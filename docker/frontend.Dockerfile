FROM node:lts-bullseye as frontend-builder
RUN apt update && apt install -y \
  build-essential \
  chromium \
  nginx \
  && apt clean

RUN mkdir /build
WORKDIR /build
COPY ../.yarn/plugins ./.yarn/plugins
COPY ../.yarn/releases ./.yarn/releases
COPY .npmignore .yarnrc.yml tsconfig.json turbo.json package.json yarn.lock ./
COPY ../scripts/package.json ./scripts/package.json
COPY ../rrweb/packages/rrdom/package.json ./rrweb/packages/rrdom/package.json
COPY ../rrweb/packages/rrdom-nodejs/package.json ./rrweb/packages/rrdom-nodejs/package.json
COPY ../rrweb/packages/rrweb/package.json ./rrweb/packages/rrweb/package.json
COPY ../rrweb/packages/rrweb-player/package.json ./rrweb/packages/rrweb-player/package.json
COPY ../rrweb/packages/rrweb-snapshot/package.json ./rrweb/packages/rrweb-snapshot/package.json
COPY ../rrweb/packages/types/package.json ./rrweb/packages/types/package.json
COPY ../packages/ui/package.json ./packages/ui/package.json
COPY ../render/package.json ./render/package.json
COPY ../sourcemap-uploader/package.json ./sourcemap-uploader/package.json
COPY ../highlight-javascript/client/package.json ./highlight-javascript/client/package.json
COPY ../highlight-javascript/firstload/package.json ./highlight-javascript/firstload/package.json
COPY ../highlight-javascript/highlight-next/package.json ./highlight-javascript/highlight-next/package.json
COPY ../highlight-javascript/highlight-node/package.json ./highlight-javascript/highlight-node/package.json
COPY ../frontend/package.json ./frontend/package.json
RUN yarn

COPY ../scripts ./scripts
COPY ../rrweb ./rrweb
COPY ../packages ./packages
COPY ../render ./render
COPY ../sourcemap-uploader ./sourcemap-uploader
COPY ../highlight-javascript ./highlight-javascript
COPY ../frontend ./frontend
COPY ../backend/public-graph ./backend/public-graph
COPY ../backend/private-graph ./backend/private-graph

# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG NODE_OPTIONS="--max-old-space-size=16384"
ARG REACT_APP_COMMIT_SHA
ARG REACT_APP_DEMO_SESSION
ARG REACT_APP_ENVIRONMENT
ARG REACT_APP_FIREBASE_CONFIG_OBJECT
ARG REACT_APP_FRONTEND_ORG
ARG REACT_APP_FRONTEND_URI
ARG REACT_APP_ONPREM
ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ARG TURBO_TEAM
RUN yarn build:frontend

COPY ../docker/nginx.conf /etc/nginx/sites-enabled/default
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key

CMD ["nginx", "-g", "daemon off;"]
