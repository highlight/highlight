---
title: Application Architecture
slug: architecture
createdAt: 2023-01-24T20:28:14.000Z
updatedAt: 2023-01-24T02:07:22.000Z
---

# Application Architecture

Here's the high level structure of the code that you'll want to start tinkering with.

- SDKs `sdk/`

  - Firstload

  - Client

  - highlight-node / other SDKs

- Public Graph `backend/public-graph/graph/schema.resolvers.go` SDK data ingest graphql endpoint, hosted locally at https://localhost:8082/public

- Private Graph `backend/private-graph/graph/schema.resolvers.go` Graphql endpoint for frontend, hosted locally at https://localhost:8082/private

- Workers `backend/worker.go`

  - Public graph worker `processPublicWorkerMessage`

  - Async worker `Start`

## General Architecture Diagram

![](/images/architecture.png)

## Code Structure Diagram

![](/images/software-components.png)

## Kafka Diagram

![](/images/kafka.png)

## InfluxDB Diagram

![](/images/influx.png)

## OpenTelemetry Diagram

![](/images/opentelemetry.png)
