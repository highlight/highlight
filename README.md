<p align="center">
  <img width="2051" alt="docs-thumbnail" src="https://user-images.githubusercontent.com/20292680/233754540-409ee4cf-beab-46b1-b313-d2d717a87fd6.png">
</p>
<p align="center">
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
- [Session Replay](#session-replay-understand-why-bugs-happen)
- [Error Monitoring](#error-monitoring-understand-what-bugs-are-happening)
- [Logging](#logging)

We strive to make highlight.io as easy to install as a few lines of code in any environment.

Read more about our [features](#features), [values](#our-values) and [mission](#our-mission) below, and get started at https://highlight.io today!

## Table of Contents

-   [Get started for free](#get-started)
-   [Features](#features)
-   [SDKs](#sdks)
-   [Contributors](#contributors)
-   [Mission](#our-mission)
-   [Values](#our-values)

## Get started

### Hosted highlight.io (free to get started!)

The fastest and most reliable way to get started with highlight.io is signing up for free at [app.highlight.io](https://app.highlight.io). After making an account, getting started is as easy as installing the [client SDK snippet](https://www.highlight.io/docs/getting-started/overview#For-your-frontend).

### Hobby self-hosted

Deploy a hobby instance in one line on Linux with Docker (we recommend at least 8GB of RAM, 4 CPUs, and 64 GB of disk space):

```bash
git clone --recurse-submodules https://github.com/highlight/highlight
# or `git submodule update --init --recursive` on git < 2.13
cd docker && ./run-hobby.sh
```

After a brief frontend load time, the app should be accessible at https://localhost

Good for <10k sessions and <50k errors ingested monthly. See our  [docs for more info and limitations](https://www.highlight.io/docs/general/company/open-source/hosting/self-host-hobby).

### Enterprise self-hosted

See our [enterprise self-hosted docs](https://www.highlight.io/docs/general/company/open-source/hosting/self-host-enterprise) to deploy a scalable, production-ready instance with support from our team.


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

### Logs: Dig deeper into what's happening on your server.

-   **Powerful Search**: Search across all your logs, with automatic property collection -> [docs](https://www.highlight.io/docs/general/product-features/general-features/search)
-   **Log Alerts**: Set thresholds for your log alerts, and view them in the alerts dashboard -> [docs](https://www.highlight.io/docs/general/product-features/general-features/alerts)
-   **Embedded Session Replay and Errors**: See all of the sessions & errors associated to a log.
-   **SDK Support**: Support for a long (and growing!) list of [SDKs](#sdks).
-   **Integrations with your favorite tools** -> [docs](https://highlight.io/docs/general/integrations/overview)

<p align="center">
<img width="600" alt="logging" src="https://user-images.githubusercontent.com/20292680/233539519-f8f58251-5b88-4703-8bea-2cd8d9549faf.png">
</p>

### Traces: Track the performance of operations on your server.

-   **Powerful Search**: Search across all your traces, with automatic property collection -> [docs](https://www.highlight.io/docs/general/product-features/general-features/search)
-   **Log Alerts**: Set thresholds for your log alerts, and view them in the alerts dashboard -> [docs](https://www.highlight.io/docs/general/product-features/general-features/alerts)
-   **Embedded Session Replay, Errors and Logs**: See all of the sessions, errors, and logs associated to a trace.
-   **SDK Support**: Support for a long (and growing!) list of [SDKs](#sdks).
-   **Integrations with your favorite tools** -> [docs](https://highlight.io/docs/general/integrations/overview)

<p align="center">
<img width="600" alt="logging" src="https://github.com/highlight/highlight/assets/20292680/61125b61-b5b8-4de3-9dc0-0c34d11b2d1d">
</p>


### More?! Metrics? Traces? Merch?

Have an idea for what we should build next? Please share our [community](https://highlight.io/community) or via a Github Issue!

[Read a full list of highlight.io features](https://highlight.io/docs).

## SDKs

All of our SDKs for highlight.io can be found in the `sdk` [directory](https://github.com/highlight/highlight/tree/main/sdk). To get started with these SDKs, we recommend the [getting started guide](https://www.highlight.io/docs/getting-started/overview) in our docs.

## Contributors

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://jaykhatri.com"><img src="https://avatars.githubusercontent.com/u/20292680?v=4?s=100" width="100px;" alt="Jay Khatri"/><br /><sub><b>Jay Khatri</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=jay-khatri" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=jay-khatri" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://vadweb.us"><img src="https://avatars.githubusercontent.com/u/1351531?v=4?s=100" width="100px;" alt="Vadim Korolik"/><br /><sub><b>Vadim Korolik</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=Vadman97" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=Vadman97" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/86132398?v=4?s=100" width="100px;" alt="Zane Mayberry"/><br /><sub><b>Zane Mayberry</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=mayberryzane" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=mayberryzane" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://elmthomas.com/"><img src="https://avatars.githubusercontent.com/u/58678?v=4?s=100" width="100px;" alt="Eric Thomas"/><br /><sub><b>Eric Thomas</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=et" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=et" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/308182?v=4?s=100" width="100px;" alt="Chris Schmitz"/><br /><sub><b>Chris Schmitz</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=ccschmitz" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=ccschmitz" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/878947?v=4?s=100" width="100px;" alt="Chris Esplin"/><br /><sub><b>Chris Esplin</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=deltaepsilon" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=deltaepsilon" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/17744174?v=4?s=100" width="100px;" alt="Spencer Amarantides"/><br /><sub><b>Spencer Amarantides</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=SpennyNDaJets" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=SpennyNDaJets" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/25088104?v=4?s=100" width="100px;" alt="Abhishek More"/><br /><sub><b>Abhishek More</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=Abhishek-More" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/19144605?v=4?s=100" width="100px;" alt="Aaron"/><br /><sub><b>Aaron</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=Crawron" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/114743131?v=4?s=100" width="100px;" alt="Julian Schneider"/><br /><sub><b>Julian Schneider</b></sub><br /><a href="#design-julian-highlight" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.cameronbrill.me/"><img src="https://avatars.githubusercontent.com/u/37822869?v=4?s=100" width="100px;" alt="Cameron Brill"/><br /><sub><b>Cameron Brill</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=cameronbrill" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://aptford.com"><img src="https://avatars.githubusercontent.com/u/17913919?v=4?s=100" width="100px;" alt="Sasha Aptlin"/><br /><sub><b>Sasha Aptlin</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=aptlin" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/696206?v=4?s=100" width="100px;" alt="Richard Hua"/><br /><sub><b>Richard Hua</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=richardhuaaa" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://anthonyteo.com/"><img src="https://avatars.githubusercontent.com/u/29858539?v=4?s=100" width="100px;" alt="Anthony Teo"/><br /><sub><b>Anthony Teo</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=eightants" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/22564894?v=4?s=100" width="100px;" alt="Nathan Brockway"/><br /><sub><b>Nathan Brockway</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=nathanjbrockway" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://phamous.dev/"><img src="https://avatars.githubusercontent.com/u/16027268?v=4?s=100" width="100px;" alt="John Pham"/><br /><sub><b>John Pham</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=JohnPhamous" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/6934200?v=4?s=100" width="100px;" alt="Lewis Liu"/><br /><sub><b>Lewis Liu</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=lewisl9029" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/19603573?v=4?s=100" width="100px;" alt="Darius"/><br /><sub><b>Darius</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=itsMapleLeaf" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://geooot.com/"><img src="https://avatars.githubusercontent.com/u/7832610?v=4?s=100" width="100px;" alt="George Thayamkery"/><br /><sub><b>George Thayamkery</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=geooot" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/94234459?v=4?s=100" width="100px;" alt="Betty Alagwu"/><br /><sub><b>Betty Alagwu</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=betty-alagwu" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/59704103?v=4?s=100" width="100px;" alt="Aaron Carver"/><br /><sub><b>Aaron Carver</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=aaronmaxcarver" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://nathanreddy.com/"><img src="https://avatars.githubusercontent.com/u/24493949?v=4?s=100" width="100px;" alt="Nathan R"/><br /><sub><b>Nathan R</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=OneWebDev" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/9276441?v=4?s=100" width="100px;" alt="denise"/><br /><sub><b>denise</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=denise-sanders" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/82889377?v=4?s=100" width="100px;" alt="Xiaojing Chen"/><br /><sub><b>Xiaojing Chen</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=d29107d" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/1341253?v=4?s=100" width="100px;" alt="Shayne O'Sullivan"/><br /><sub><b>Shayne O'Sullivan</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=shayneo" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/13753840?v=4?s=100" width="100px;" alt="Nils Gereke"/><br /><sub><b>Nils Gereke</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=NgLoader" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=NgLoader" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/4224692?v=4?s=100" width="100px;" alt="Nir Gazit"/><br /><sub><b>Nir Gazit</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=nirga" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/17701547?v=4?s=100" width="100px;" alt="Jayant Keswani"/><br /><sub><b>Jayant Keswani</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=jayantkeswani" title="Code">💻</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/62416191?v=4?s=100" width="100px;" alt="wancup"/><br /><sub><b>wancup</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=wancup" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/81020469?v=4?s=100" width="100px;" alt="Adam from Buildjet"/><br /><sub><b>Adam from Buildjet</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=thinkafterbefore" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/9993537?v=4?s=100" width="100px;" alt="Nick Fiacco"/><br /><sub><b>Nick Fiacco</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=nfiacco" title="Code">💻</a> <a href="https://github.com/highlight/highlight/commits?author=nfiacco" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/373462?v=4?s=100" width="100px;" alt="Mark Chapman"/><br /><sub><b>Mark Chapman</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=mchapman" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/86283021?v=4?s=100" width="100px;" alt="edde746"/><br /><sub><b>edde746</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=edde746" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/361348?v=4?s=100" width="100px;" alt="Lucas Lemanowicz"/><br /><sub><b>Lucas Lemanowicz</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=LucasLemanowicz" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/1935696?v=4?s=100" width="100px;" alt="Karl Horky"/><br /><sub><b>Karl Horky</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=karlhorky" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><img src="https://avatars.githubusercontent.com/u/4401263?v=4?s=100" width="100px;" alt="Pedro Saratscheff"/><br /><sub><b>Pedro Saratscheff</b></sub><br /><a href="https://github.com/highlight/highlight/commits?author=saratscheff" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://grantmercer.dev"><img src="https://avatars.githubusercontent.com/u/1827631?v=4?s=100" width="100px;" alt="Grant Mercer"/><br /><sub><b>Grant Mercer</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=Syntaf" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/LewisW"><img src="https://avatars.githubusercontent.com/u/17803?v=4?s=100" width="100px;" alt="Lewis"/><br /><sub><b>Lewis</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=LewisW" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://kalibetre.netlify.app"><img src="https://avatars.githubusercontent.com/u/105339878?v=4?s=100" width="100px;" alt="Kalkidan Betre"/><br /><sub><b>Kalkidan Betre</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=kalibetre" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://tooluloope.netlify.com/"><img src="https://avatars.githubusercontent.com/u/31691737?v=4?s=100" width="100px;" alt="Tolulope Adetula"/><br /><sub><b>Tolulope Adetula</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=Tooluloope" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jemiluv8"><img src="https://avatars.githubusercontent.com/u/119384208?v=4?s=100" width="100px;" alt="jemiluv8"/><br /><sub><b>jemiluv8</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=jemiluv8" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://mogery.me"><img src="https://avatars.githubusercontent.com/u/66118807?v=4?s=100" width="100px;" alt="Gergő Móricz"/><br /><sub><b>Gergő Móricz</b></sub></a><br /><a href="https://github.com/highlight/highlight/commits?author=mogery" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

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
