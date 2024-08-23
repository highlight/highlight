ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME}

ENV NODE_VERSION=20.17.0
ENV NODE_PATH=/root/.nvm/v$NODE_VERSION/lib/node_modules
ENV PATH=/root/.nvm/versions/node/v$NODE_VERSION/bin:$PATH

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN \. "/root/.nvm/nvm.sh" \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION  \
    && nvm use default

WORKDIR /highlight/e2e/express
COPY ./express/package.json .
RUN npm install
RUN /root/.nvm/versions/node/v$NODE_VERSION/bin/npm install
COPY ./express .

ENV BACKEND_URI="http://localhost:3003/"
CMD ["npm", "run", "dev"]
