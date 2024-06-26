FROM --platform=$BUILDPLATFORM node:lts-alpine as frontend-build

RUN apk update && apk add --no-cache build-base chromium python3

WORKDIR /highlight
COPY .npmignore .prettierrc .prettierignore graphql.config.js tsconfig.json turbo.json .yarnrc.yml package.json yarn.lock ./
COPY ../.yarn/releases ./.yarn/releases
COPY ../.yarn/patches ./.yarn/patches
COPY ../backend/private-graph ./backend/private-graph
COPY ../backend/public-graph ./backend/public-graph
COPY ../backend/localhostssl ./backend/localhostssl
COPY ../blog-content ./blog-content
COPY ../docs-content ./docs-content
COPY ../frontend ./frontend
COPY ../highlight.io ./highlight.io
COPY ../opentelemetry-sdk-workers ./opentelemetry-sdk-workers
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
ARG CLICKUP_CLIENT_ID
ARG DEMO_PROJECT_ID
ARG DISCORD_CLIENT_ID
ARG GITHUB_CLIENT_ID
ARG GITLAB_CLIENT_ID
ARG HEIGHT_CLIENT_ID
ARG JIRA_CLIENT_ID
ARG LINEAR_CLIENT_ID
ARG MICROSOFT_TEAMS_BOT_ID
ARG REACT_APP_AUTH_MODE
ARG REACT_APP_COMMIT_SHA
ARG REACT_APP_FIREBASE_CONFIG_OBJECT
ARG REACT_APP_FRONTEND_ORG
ARG REACT_APP_FRONTEND_URI
ARG REACT_APP_FRONT_INTEGRATION_CLIENT_ID
ARG REACT_APP_IN_DOCKER
ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ARG REACT_APP_STRIPE_API_PK
ARG REACT_APP_VERCEL_INTEGRATION_NAME
ARG SLACK_CLIENT_ID
ARG TURBO_TEAM
ARG TURBO_TOKEN
RUN yarn build:frontend

# reduce the image size by keeping just the built code
FROM nginx:stable-alpine as frontend-prod
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

ARG REACT_APP_PRIVATE_GRAPH_URI
ARG REACT_APP_PUBLIC_GRAPH_URI
ENV REACT_APP_PRIVATE_GRAPH_URI=$REACT_APP_PRIVATE_GRAPH_URI
ENV REACT_APP_PUBLIC_GRAPH_URI=$REACT_APP_PUBLIC_GRAPH_URI
CMD ["python3", "/frontend-entrypoint.py"]
