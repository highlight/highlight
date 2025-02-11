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
    <DocsCard title="React" href="./browser/reactjs.md">
        {"Get started in your React.js app"}
    </DocsCard>
    <DocsCard title="Angular"  href="./browser/angular.md">
        {"Get started in your Angular.js app"}
    </DocsCard>
    <DocsCard title="Gatsby"  href="./browser/gatsbyjs.md">
        {"Get started in your Gatsby app"}
    </DocsCard>
    <DocsCard title="Next.js"  href="./browser/nextjs.md">
        {"Get started in your Next.js app"}
    </DocsCard>
    <DocsCard title="Remix"  href="./browser/remix.md">
        {"Get started in your Remix app"}
    </DocsCard>
    <DocsCard title="VueJS"  href="./browser/vuejs.md">
        {"Get started in your VueJS app"}
    </DocsCard>
    <DocsCard title="SvelteKit"  href="./browser/6_sveltekit.md">
        {"Get started in your SvelteKit app"}
    </DocsCard>
    <DocsCard title="Electron"  href="./browser/7_electron.md">
        {"Get started in your Electron app"}
    </DocsCard>
    <DocsCard title="Other HTML"  href="./browser/8_other.md">
        {"Get started in any HTML/JS app"}
    </DocsCard>
    <DocsCard title="React Native" href="./browser/9_react-native.md">
        {"Get started with React Native"}
    </DocsCard>
</DocsCardGroup>

## For your Server

Highlight.io also supports reporting errors, logging, and tracing from your backend and mapping these to corresponding sessions. This gives you and your team a full picture of your application's state. Supported frameworks / languages below:

<DocsCardGroup>
    <DocsCard title="Go" href="./server/go/overview">
        {"Get started with Highlight in Go"}
    </DocsCard>
    <DocsCard title="JS / TS" href="./server/js/overview">
        {"Get started with Highlight in Javascript"}
    </DocsCard>
    <DocsCard title="Python" href="./server/python/overview">
        {"Get started with Highlight in Python"}
    </DocsCard>
    <DocsCard title="Ruby" href="./server/ruby/1_overview.md">
        {"Get started with Highlight in Ruby"}
    </DocsCard>
    <DocsCard title="Rust" href="./server/rust/1_overview.md">
        {"Get started with Highlight in Rust"}
    </DocsCard>
    <DocsCard title="Elixir" href="./server/elixir/1_overview.md">
        {"Get started with Highlight in Elixir"}
    </DocsCard>
    <DocsCard title="Java" href="./server/java/1_overview.md">
        {"Get started with Highlight in Java"}
    </DocsCard>
    <DocsCard title="PHP" href="./server/php/1_overview.md">
        {"Get started with Highlight in PHP"}
    </DocsCard>
    <DocsCard title="C# .NET" href="./server/dotnet.md">
        {"Get started with Highlight in C# .NET"}
    </DocsCard>
    <DocsCard title="C# .NET 4" href="./server/dotnet-4.md">
        {"Get started with Highlight in C# .NET 4"}
    </DocsCard>
    <DocsCard title="Native OpenTelemetry" href="./6_native-opentelemetry/2_error-monitoring.md">
        {"Get started with OpenTelemetry"}
    </DocsCard>
</DocsCardGroup>

## Hosting Platform Logging

Highlight.io provides comprehensive logging support for various hosting platforms, allowing you to seamlessly integrate and manage logs from your infrastructure. Supported hosting platforms include:

<DocsCardGroup>
    <DocsCard title="Cloud" href="./server/6_hosting/1_overview.md">
        {"Log from your Cloud Hosting Environment"}
    </DocsCard>
    <DocsCard title="curl" href="./server/http.md">
        {"Send logs over HTTPS"}
    </DocsCard>
    <DocsCard title="Docker" href="./server/docker.md">
        {"Stream Docker logs"}
    </DocsCard>
    <DocsCard title="Fluent Forward" href="./server/fluentforward.md">
        {"Send Fluent Forward (Fluentd / Fluent Bit) logs"}
    </DocsCard>
    <DocsCard title="File" href="./server/file.md">
        {"Stream any log file"}
    </DocsCard>
</DocsCardGroup>

### Something missing?

If there's a guide missing for your framework, feel free to [create an issue](https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=) or message us on [discord](https://highlight.io/community).
