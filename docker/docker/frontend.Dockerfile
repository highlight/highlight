FROM --platform=$BUILDPLATFORM node:lts-alpine AS frontend-build

RUN wget -q -t3 'https://packages.doppler.com/public/cli/rsa.8004D9FF50437357.key' -O /etc/apk/keys/cli@doppler-8004D9FF50437357.rsa.pub && \
    echo 'https://packages.doppler.com/public/cli/alpine/any-version/main' | tee -a /etc/apk/repositories && \
    apk update && apk add --no-cache build-base chromium curl doppler python3

WORKDIR /highlight
COPY .npmignore .prettierrc .prettierignore graphql.config.js tsconfig.json turbo.json .yarnrc.yml package.json yarn.lock ./
COPY ../.yarn/patches ./.yarn/patches
COPY ../.yarn/releases ./.yarn/releases
COPY ../docs-content/package.json ./docs-content/package.json
COPY ../e2e ./e2e
COPY ../frontend/package.json ./frontend/package.json
COPY ../highlight.io/package.json ./highlight.io/package.json
COPY ../opentelemetry-sdk-workers/packages/opentelemetry-sdk-workers/package.json ./opentelemetry-sdk-workers/packages/opentelemetry-sdk-workers/package.json
COPY ../packages ./packages
COPY ../render/package.json ./render/package.json
COPY ../rrweb ./rrweb
COPY ../scripts/package.json ./scripts/package.json
COPY ../sdk/client/package.json ./sdk/client/package.json
COPY ../sdk/firstload/package.json ./sdk/firstload/package.json
COPY ../sdk/highlight-apollo/package.json ./sdk/highlight-apollo/package.json
COPY ../sdk/highlight-cloudflare/package.json ./sdk/highlight-cloudflare/package.json
COPY ../sdk/highlight-chrome/package.json ./sdk/highlight-chrome/package.json
COPY ../sdk/highlightinc-highlight-datasource/package.json ./sdk/highlightinc-highlight-datasource/package.json
COPY ../sdk/highlight-nest/package.json ./sdk/highlight-nest/package.json
COPY ../sdk/highlight-next/package.json ./sdk/highlight-next/package.json
COPY ../sdk/highlight-node/package.json ./sdk/highlight-node/package.json
COPY ../sdk/highlight-hono/package.json ./sdk/highlight-hono/package.json
COPY ../sdk/highlight-react/package.json ./sdk/highlight-react/package.json
COPY ../sdk/highlight-remix/package.json ./sdk/highlight-remix/package.json
COPY ../sdk/pino/package.json ./sdk/pino/package.json
COPY ../sourcemap-uploader/package.json ./sourcemap-uploader/package.json
RUN yarn install --immutable
COPY ../backend/localhostssl ./backend/localhostssl
COPY ../backend/private-graph ./backend/private-graph
COPY ../backend/public-graph ./backend/public-graph
COPY ../blog-content ./blog-content
COPY ../docs-content ./docs-content
COPY ../e2e ./e2e
COPY ../frontend ./frontend
COPY ../highlight.io ./highlight.io
COPY ../opentelemetry-sdk-workers ./opentelemetry-sdk-workers
COPY ../packages ./packages
COPY ../render ./render
COPY ../rrweb ./rrweb
COPY ../scripts ./scripts
COPY ../sdk ./sdk
COPY ../sourcemap-uploader ./sourcemap-uploader

# These three 'args' need to be here because they're injected at build time
# all other env variables are provided in environment.yml.
ARG NODE_OPTIONS="--max-old-space-size=16384 --openssl-legacy-provider"
ARG DOPPLER_TOKEN
RUN doppler me
RUN doppler run -- yarn build:frontend

# reduce the image size by keeping just the built code
FROM nginx:stable-alpine AS frontend-prod
RUN apk update && apk add --no-cache python3
LABEL org.opencontainers.image.source=https://github.com/highlight/highlight
LABEL org.opencontainers.image.description="highlight.io Production Frontend Image"
LABEL org.opencontainers.image.licenses="Apache 2.0"

COPY ../docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY ../backend/localhostssl/server.key /etc/ssl/private/ssl-cert.key
COPY ../backend/localhostssl/server.pem /etc/ssl/certs/ssl-cert.pem
COPY ../docker/frontend-entrypoint.py /frontend-entrypoint.py

WORKDIR /build
COPY --from=frontend-build /highlight/frontend/build /build/frontend/build

ARG REACT_APP_AUTH_MODE
ARG REACT_APP_FRONTEND_URI
ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ARG REACT_APP_OTLP_ENDPOINT
ARG REACT_APP_DISABLE_ANALYTICS
ENV REACT_APP_AUTH_MODE=$REACT_APP_AUTH_MODE
ENV REACT_APP_FRONTEND_URI=$REACT_APP_FRONTEND_URI
ENV REACT_APP_PRIVATE_GRAPH_URI=$REACT_APP_PRIVATE_GRAPH_URI
ENV REACT_APP_PUBLIC_GRAPH_URI=$REACT_APP_PUBLIC_GRAPH_URI
ENV REACT_APP_OTLP_ENDPOINT=$REACT_APP_OTLP_ENDPOINT
ENV REACT_APP_DISABLE_ANALYTICS=$REACT_APP_DISABLE_ANALYTICS
CMD ["python3", "/frontend-entrypoint.py"]
