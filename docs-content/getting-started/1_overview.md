---
title: Getting Started with Highlight
slug: getting-started
createdAt: 2021-09-13T22:07:04.000Z
updatedAt: 2022-12-04T00:00:00.000Z
---

Highlight.io allows you to get full-stack visibility into issues across your whole stack, all the way from a user's button click to an error in your backend infrastructure. Read more about how to get started below.

## For your Frontend

Installing highlight.io in javascript will automatically instrument frontend error collection and session replay. highlight.io supports any framework that uses modern web browsers (i.e. depends on using the [DOM](https://www.w3schools.com/js/js_htmldom.asp)) under the hood, and we support all modern browsers to date. Take a look at our guides for the following frameworks:

<DocsCardGroup>
    <DocsCard title="React" href="./client-sdk/reactjs.md">
        {"Get started in your React.js app"}
    </DocsCard>
    <DocsCard title="Angular"  href="./client-sdk/angular.md">
        {"Get started in your Angular.js app"}
    </DocsCard>
    <DocsCard title="Gatsby"  href="./client-sdk/gatsbyjs.md">
        {"Get started in your Gatsby app"}
    </DocsCard>
    <DocsCard title="Next.js"  href="./client-sdk/nextjs.md">
        {"Get started in your Next.js app"}
    </DocsCard>
    <DocsCard title="Remix"  href="./client-sdk/remix.md">
        {"Get started in your Remix app"}
    </DocsCard>
    <DocsCard title="VueJS"  href="./client-sdk/vuejs.md">
        {"Get started in your VueJS app"}
    </DocsCard>
    <DocsCard title="SvelteKit"  href="./3_client-sdk/6_sveltekit.md">
        {"Get started in your SvelteKit app"}
    </DocsCard>
    <DocsCard title="Other HTML"  href="./3_client-sdk/7_other.md">
        {"Get started in any HTML/JS app"}
    </DocsCard>
</DocsCardGroup>

## For your Backend

Highlight.io also supports reporting errors, logging, and tracing from your backend and mapping these to corresponding sessions. This gives you and your team a full picture of your application's state. Supported languages below:

<DocsCardGroup>
    <DocsCard title="Python" href="./backend/python/overview">
        {"Get started in your Python app"}
    </DocsCard>
</DocsCardGroup>

### Hosting Platform Logging

<DocsCardGroup>
    <DocsCard title="Cloud" href="./backend-logging/07_hosting/1_overview.md">
        {"Log from your Cloud Hosting Environment"}
    </DocsCard>
    <DocsCard title="curl" href="./backend-logging/08_http.md">
        {"Send logs over HTTPS"}
    </DocsCard>
    <DocsCard title="Docker" href="./backend-logging/09_docker.md">
        {"Stream Docker logs"}
    </DocsCard>
    <DocsCard title="Fluent Forward" href="./backend-logging/11_fluentforward.md">
        {"Send Fluent Forward (Fluentd / Fluent Bit) logs"}
    </DocsCard>
    <DocsCard title="File" href="./backend-logging/10_file.md">
        {"Stream any log file"}
    </DocsCard>
</DocsCardGroup>

### Something missing?

If there's a guide missing for your framework, feel free to [create an issue](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=) or message us on [discord](https://highlight.io/community).
