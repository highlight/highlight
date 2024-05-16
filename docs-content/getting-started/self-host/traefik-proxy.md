---
title: Traefik SSL Proxying.
slug: traefik-proxy
---

# Highlight Deployment with Traefik on Docker

This documentation provides guidance on deploying Highlight with Traefik as a reverse proxy on a Docker environment. It
includes detailed steps for configuring Docker Compose files and environment settings to ensure successful deployment
and operation.

## Overview

Deploying Highlight with Traefik involves setting up Docker containers for Highlight's frontend and backend services,
configuring Traefik to route traffic appropriately, and ensuring SSL termination is handled by Traefik instead of the
internal services.

## Docker Compose Configuration

Below is an example `docker-compose.yml` configuration for setting up Highlight services with Traefik labels for
routing:

```yaml
version: '3.7'

services:
  backend:
    image: ghcr.io/highlight/highlight-backend:latest
    container_name: backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.highlight-backend.rule=Host(`highlight.example.com`)"
      - "traefik.http.services.highlight-backend.loadbalancer.server.port=8082"

    expose:
      - "8082"

    networks:
      - proxy
      - highlight

  frontend:
    image: ghcr.io/highlight/highlight-frontend:latest
    container_name: frontend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.highlight-frontend.rule=Host(`highlight.example.com`)"
      - "traefik.http.services.highlight-frontend.loadbalancer.server.port=3000"
    expose:
      - "3000"

    networks:
      - proxy
      - highlight

networks:
  proxy:
    external: true
  highlight:
    external: true
```

## Environment Configuration

Ensure the `.env` file contains the necessary environment variables for Highlight and Traefik:

```plaintext

SSL=false  # Disable SSL in Highlight services, let Traefik handle SSL termination

REACT_APP_PRIVATE_GRAPH_URI=http://backend:8082

REACT_APP_PUBLIC_GRAPH_URI=http://frontend:3000

```

## Traefik Configuration

Configure Traefik to handle SSL termination and route requests based on the hostname. Here is an example snippet from
Traefik's configuration:

```yaml

entryPoints:
  web:
    address: ":80"
  websecure:
    address: ":443"

certificatesResolvers:
  myresolver:
    acme:
      email: your-email@example.com
    storage: acme.json
    httpChallenge:
      entryPoint: web
    providers:
      docker:
        exposedByDefault: false
```

## Testing and Validation

After configuring and starting your Docker containers, validate the setup by accessing `https://highlight.example.com`
in your browser. Ensure that both frontend and backend services are reachable and that SSL certificates are correctly
applied by Traefik.

For more detailed information on setting up Highlight and integrating with Docker and Traefik, refer to the official
documentation:

- [Highlight Documentation](https://www.highlight.io/docs/)

- [Traefik Documentation](https://doc.traefik.io/traefik/)

This setup ensures that Highlight runs smoothly with Traefik handling routing and SSL, providing a robust solution for
monitoring applications in a Docker environment.
