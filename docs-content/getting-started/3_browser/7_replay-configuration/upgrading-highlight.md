---
title: Upgrading Highlight
slug: upgrading-highlight
createdAt: 2021-09-14T00:13:12.000Z
updatedAt: 2022-03-08T00:55:27.000Z
---

Highlight is shipping improvements multiple times a day. Non-breaking changes will automatically be applied to your applications without any action needed by you.

If Highlight ships a breaking change (new feature, security fix, etc.), we'll need your help to upgrade Highlight in your application. We aim to give 2 weeks notice in the event this happens. We recognize that there will be clients still using older versions of Highlight so we make sure all of our changes are backwards compatible.

## Using a Package Manager

```shell
# with npm
npm install highlight.run@latest
```

```shell
# with yarn
yarn upgrade highlight.run@latest
```

## HTML/CDN

Replace the Highlight snippet in your `index.html` with the one on [https://app.highlight.io/setup](https://app.highlight.io/setup).

## Changelog

To see if a new version has any breaking changes, see [Changelog](https://highlight.canny.io/changelog).
