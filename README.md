<p align="center">
  <img width="2051" alt="github-thumb" src="https://user-images.githubusercontent.com/20292680/214453237-37420cc6-1ae1-474e-be55-d41fea21e0be.png">
</p>
<p align="center">
  <a href='https://github.com/highlight/highlight/graphs/contributors'><img src='https://img.shields.io/badge/all_contributors-17-orange.svg' /></a>
  <a href='http://makeapullrequest.com'><img alt='PRs Welcome' src='https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=shields'/></a>
  <a href='https://highlight.io/community'><img alt="Join Discord Community" src="https://img.shields.io/badge/discord%20community-join-blue"/></a>
  <img alt="GitHub commit activity" src="https://img.shields.io/github/commit-activity/m/highlight/highlight"/>
  <img alt="GitHub closed issues" src="https://img.shields.io/github/issues-closed/highlight/highlight"/>
</p>

<p align="center">
  <a href="https://highlight.io/docs">Docs</a> - <a href="https://highlight.io/community">Community (Support & Feedback)</a> - <a href="https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=feature_request.md&title=">Feature request</a> - <a href="https://github.com/highlight/highlight/issues/new?assignees=&labels=external+bug+%2F+request&template=bug_report.md&title=">Bug report</a>
</p>

# [highlight.io](https://highlight.io): The open-source, fullstack monitoring platform.

highlight.io is a monitoring tool for the next generation of developers (like you!). Unlike the age-old, outdated tools out there, we aim to build a [cohesive](#we-build-a-cohesive-product), [modern](#we-build-for-todays-developer) and [fully-featured](#features) monitoring solution, something we wished WE had. And it's all open source :)

At a high level, highlight.io's feature set is:
- Session Replay (read more [here](#session-replay-understand-why-bugs-happen))
- Error Monitoring (read more [here](#error-monitoring-understand-what-bugs-are-happening))
- Logging (read more [here](#logging))

Read more about our [features](#features) below.

We strive to make highlight.io as easy to install as a few lines of code in any environment.

Read more about our [features](#features), [values](#our-values) and [mission](#our-mission) below, and get started at https://highlight.io today!

## Table of Contents

-   [Get started for free](#get-started)
-   [Features](#features)
-   [SDKs](#sdks)
-   [Mission](#our-mission)
-   [Values](#our-values)

## Get started

### Hosted highlight.io (free to get started!)

The fastest and most reliable way to get started with highlight.io is signing up for free at [app.highlight.io](https://app.highlight.io). After making an account, getting started is as easy as installing the [client SDK snippet](https://www.highlight.io/docs/getting-started/overview#For-your-frontend).

### Hobby self-hosted

Deploy a hobby instance in one line on Linux with Docker (we recommend at least 6GB of RAM, 2 CPUs, and 64 GB of disk space):

```bash
git clone --recurse-submodules https://github.com/highlight/highlight
# or `git submodule update --init --recursive` on git < 2.13
cd docker && ./run-hobby.sh
```

After a brief frontend load time, the app should be accessible at https://localhost:3000

Good for <10k sessions and <50k errors ingested monthly. See our  [docs for more info and limitations](https://www.highlight.io/docs/general/company/open-source/self-host-hobby).

### Developing on Highlight

Want to contribute to Highlight? See our [onboarding](./DEVELOPER_ONBOARDING.md) guide.

### Enterprise self-hosted

See our [enterprise self-hosted docs](https://www.highlight.io/docs/general/company/open-source/self-host-enterprise) to deploy a scalable, production-ready instance with support from our team.

## Features

### Session Replay: Understand WHY bugs happen.

-   **Dom-based High-fidelity Replay**: Replay every interaction and dom change that happened in a given browser session (powered by https://github.com/rrweb-io/rrweb)
-   **Outgoing Network Requests**: See all the network requests (and their contents) in a given session to reproduce the data that was sent/received by your frontend -> [docs](https://www.highlight.io/docs/general/product-features/session-replay/dev-tools)
-   **Console logs**: Analyze the logs printed (`console.error`, `console.log`, etc..) to the console from your frontend -> [docs](https://www.highlight.io/docs/general/product-features/session-replay/dev-tools)
-   **Embedded Error Monitoring**: See the errors associated with a given session to understand what the user was doing leading up to them.
-   **Session Comments**: Comment on errors to communicate with your team on user frustration, bugs, and more! -> [docs](https://www.highlight.io/docs/general/product-features/general-features/comments)
-   **Integrations with your favorite tools** -> [docs](https://highlight.io/docs/general/integrations/overview)

<p align="center">
<img width="600" alt="Frame 43972" src="https://user-images.githubusercontent.com/20292680/214499701-86b7deb3-ec8f-4cb2-8661-ff4f9d7ade2d.png">
</p>

### Error Monitoring: Understand WHAT bugs are happening.

-   **Customizable Error Grouping**: Customize rules for grouping repeated errors -> [docs](https://www.highlight.io/docs/general/product-features/error-monitoring/grouping-errors)
-   **Customizable Alerting Rules**: Customize how often, and where alerts are sent -> [docs](https://www.highlight.io/docs/general/product-features/general-features/alerts)
-   **Embedded Session Replay**: See all of the sessions associated with any given error.
-   **SDK Support**: Support for a long (and growing!) list of [SDKs](#sdks).
-   **Integrations with your favorite tools** -> [docs](https://highlight.io/docs/general/integrations/overview)

<p align="center">
<img width="600" alt="error-monitoring" src="https://user-images.githubusercontent.com/20292680/214500108-c8e0e289-276a-4863-816a-7c854c97df4e.png">
</p>

### Logging

-   **Powerful Log Search**: Search across all your logs, with automatic property collection -> [docs](https://www.highlight.io/docs/general/product-features/logging/log-search)
-   **Log Alerts**: Set thresholds for your log alerts, and view them in the alerts dashboard -> [docs](https://www.highlight.io/docs/general/product-features/general-features/alerts)
-   **Embedded Session Replay and Errors**: See all of the sessions & errors associated with any given log.
-   **SDK Support**: Support for a long (and growing!) list of [SDKs](#sdks).
-   **Integrations with your favorite tools** -> [docs](https://highlight.io/docs/general/integrations/overview)

<p align="center">
<img width="600" alt="logging" src="https://user-images.githubusercontent.com/20292680/233539519-f8f58251-5b88-4703-8bea-2cd8d9549faf.png">
</p>

### More?! Metrics? Traces? Merch?

Have an idea for what we should build next? Please share our [community](https://highlight.io/community) or via a Github Issue!

[Read a full list of highlight.io features](https://highlight.io/docs).

## SDKs

All of our SDKs for highlight.io can be found in the `sdk` [directory](https://github.com/highlight/highlight/tree/main/sdk). To get started with these SDKs, we recommend the [getting started guide](https://www.highlight.io/docs/getting-started/overview) in our docs.

## Our Mission

Our mission is to support developers like you in shipping with confidence. We do this by giving you the tools you need to **uncover, resolve, and prevent** issues in your web app.

## Our Values

### We build in public.

We strive to build in public in every way we can. This means that what we built, what we're building, and what we plan to build is shared with the world.

### We build a cohesive product.

People may think that we're building multiple products (session replay, error monitoring, etc..). But we see it as one. Before we build anything new, we prioritize making it operate seemlessly with everything else.

### We build for today's developer.

If you're building software, why should you care about grafana or loki or the elk stack? highlight.io is built for developers that want to **develop**. Leave the monitoring stuff to us 👍.

Read more about [our values here](https://www.highlight.io/docs/general/company/values).
