FROM node:lts-bullseye as frontend-base
RUN apt update && apt install -y \
  build-essential \
  chromium \
  nginx \
  && apt clean

WORKDIR /build
COPY ../.yarn/plugins ./.yarn/plugins
COPY ../.yarn/releases ./.yarn/releases
COPY .yarnrc.yml package.json yarn.lock ./
COPY ../scripts/package.json ./scripts/package.json
COPY ../rrweb/packages/rrdom/package.json ./rrweb/packages/rrdom/package.json
COPY ../rrweb/packages/rrdom-nodejs/package.json ./rrweb/packages/rrdom-nodejs/package.json
COPY ../rrweb/packages/rrweb/package.json ./rrweb/packages/rrweb/package.json
COPY ../rrweb/packages/rrweb-player/package.json ./rrweb/packages/rrweb-player/package.json
COPY ../rrweb/packages/rrweb-snapshot/package.json ./rrweb/packages/rrweb-snapshot/package.json
COPY ../rrweb/packages/web-extension/package.json ./rrweb/packages/web-extension/package.json
COPY ../rrweb/packages/types/package.json ./rrweb/packages/types/package.json
COPY ../packages/ui/package.json ./packages/ui/package.json
COPY ../packages/component-preview/package.json ./packages/component-preview/package.json
COPY ../render/package.json ./render/package.json
COPY ../sourcemap-uploader/package.json ./sourcemap-uploader/package.json
COPY ../sdk/client/package.json ./sdk/client/package.json
COPY ../sdk/firstload/package.json ./sdk/firstload/package.json
COPY ../sdk/highlight-cloudflare/package.json ./sdk/highlight-cloudflare/package.json
COPY ../sdk/highlight-apollo/package.json ./sdk/highlight-apollo/package.json
COPY ../sdk/highlight-nest/package.json ./sdk/highlight-nest/package.json
COPY ../sdk/highlight-next/package.json ./sdk/highlight-next/package.json
COPY ../sdk/highlight-node/package.json ./sdk/highlight-node/package.json
COPY ../sdk/highlight-react/package.json ./sdk/highlight-react/package.json
COPY ../highlight.io/package.json ./highlight.io/package.json
COPY ../frontend/package.json ./frontend/package.json
RUN yarn

COPY .npmignore .prettierrc .prettierignore graphql.config.js tsconfig.json turbo.json ./
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key
COPY ../backend/localhostssl/server.crt ./backend/localhostssl/server.crt
COPY ../backend/localhostssl/server.key ./backend/localhostssl/server.key
COPY ../scripts ./scripts
COPY ../rrweb ./rrweb
COPY ../packages ./packages
COPY ../render ./render
COPY ../sourcemap-uploader ./sourcemap-uploader
COPY ../sdk ./sdk
COPY ../docs-content ./docs-content
COPY ../highlight.io ./highlight.io
COPY ../frontend ./frontend
COPY ../backend/public-graph ./backend/public-graph
COPY ../backend/private-graph ./backend/private-graph

FROM frontend-base as frontend-dev
ENV NODE_OPTIONS=--openssl-legacy-provider
CMD ["yarn", "docker:frontend"]

FROM frontend-base as frontend

# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG NODE_OPTIONS="--max-old-space-size=16384"
ARG REACT_APP_AUTH_MODE
ARG REACT_APP_COMMIT_SHA
ARG REACT_APP_DEMO_SESSION
ARG REACT_APP_FIREBASE_CONFIG_OBJECT
ARG REACT_APP_FRONTEND_ORG
ARG REACT_APP_FRONTEND_URI
ARG REACT_APP_ONPREM
ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ARG TURBO_TEAM
RUN yarn build:frontend

COPY ../docker/nginx.conf /etc/nginx/sites-enabled/default

CMD ["nginx", "-g", "daemon off;"]
