ARG IMAGE_BASE_NAME="ghcr.io/highlight/e2e-base:latest"
FROM ${IMAGE_BASE_NAME}

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
RUN \. "/root/.nvm/nvm.sh" && nvm install --lts

WORKDIR /highlight/e2e/express-ts
COPY ./express-ts/package.json .
RUN npm install
COPY ./express-ts .

ENV BACKEND_URI="http://localhost:3003/"
CMD ["npm", "run", "dev"]
