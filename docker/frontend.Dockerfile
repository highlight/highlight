FROM node:lts-bullseye as frontend-builder
# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG REACT_APP_COMMIT_SHA
ARG TURBO_TEAM
RUN apt update && apt install -y \
  build-essential \
  chromium \
  nginx \
  && apt clean

RUN mkdir /build
WORKDIR /build
COPY ../.yarn/plugins ./.yarn/plugins
COPY ../.yarn/releases ./.yarn/releases
COPY ../.yarn/install-state.gz ./.yarn/install-state.gz
COPY .npmignore .yarnrc.yml ./
COPY tsconfig.json turbo.json package.json yarn.lock ./
COPY ../.turbo ./.turbo
COPY ../scripts ./scripts
COPY ../rrweb ./rrweb
COPY ../packages ./packages
COPY ../render ./render
COPY ../sourcemap-uploader ./sourcemap-uploader
COPY ../highlight-javascript ./highlight-javascript
COPY ../frontend ./frontend
COPY ../backend ./backend

RUN yarn

ENV REACT_APP_ONPREM=true
ENV RENDER_PREVIEW=true
ENV NODE_OPTIONS="--max-old-space-size=16384"
RUN yarn build:frontend

COPY ../docker/nginx.conf /etc/nginx/sites-enabled/default
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key

CMD ["nginx", "-g", "daemon off;"]
