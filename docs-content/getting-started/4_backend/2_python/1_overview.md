---
title: Overview
slug: overview
createdAt: 2024-05-16T12:00:00.000Z
updatedAt: 2024-05-16T12:00:00.000Z
---

Highlight.io supports error monitoring, logging, and tracing through the SDK's below. Highlight is also
built on OpenTelementry and can be configured manually. See [OTEL's Python Docs](https://opentelemetry.io/docs/languages/python/)
for more information.

## Supported Frameworks

Highlight supports the following languages:

<DocsCardGroup>
    <DocsCard title="AWS Lambda" href="./aws-lambda">
        {"AWS Lambda"}
    </DocsCard>
    <DocsCard title="Azure Functions" href="./azure-functions">
        {"Azure Functions"}
    </DocsCard>
    <DocsCard title="Django" href="./django">
        {"Django"}
    </DocsCard>
    <DocsCard title="FastAPI" href="./fastapi">
        {"FastAPI"}
    </DocsCard>
    <DocsCard title="Flask" href="./flask">
        {"Flask"}
    </DocsCard>
    <DocsCard title="Google Cloud Functions" href="./google-cloud-functions">
        {"Google Cloud Functions"}
    </DocsCard>
    <DocsCard title="Other" href="./other">
        {"Other"}
    </DocsCard>
</DocsCardGroup>

## Python Libraries

Check out guides to working with specific Python libraries

<DocsCardGroup>
    <DocsCard title="Loguru" href="./libraries/loguru">
        {"Logging with Loguru"}
    </DocsCard>
    <DocsCard title="Tracing" href="./libraries/tracing">
        {"Set up tracing for SQLAlchemy, Redis, and more"}
    </DocsCard>
</DocsCardGroup>

### Something missing?

<MissingFrameworkCopy/>