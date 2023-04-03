FROM node:lts-bullseye as frontend-base
RUN apt update && apt install -y \
  build-essential \
  chromium \
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
COPY ../backend/localhostssl/server.crt ./backend/localhostssl/server.crt
COPY ../backend/localhostssl/server.key ./backend/localhostssl/server.key
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem

COPY ../backend/private-graph ./backend/private-graph
COPY ../backend/public-graph ./backend/public-graph
COPY ../docs-content ./docs-content
COPY ../frontend ./frontend
COPY ../highlight.io ./highlight.io
COPY ../packages ./packages
COPY ../render ./render
COPY ../rrweb ./rrweb
COPY ../scripts ./scripts
COPY ../sdk ./sdk
COPY ../sourcemap-uploader ./sourcemap-uploader

FROM frontend-base as frontend
ENV NODE_OPTIONS=--openssl-legacy-provider
CMD ["yarn", "docker:frontend"]
