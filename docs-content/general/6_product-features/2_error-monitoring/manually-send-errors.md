---
title: Manually Reporting Errors
slug: manually-send-errors
---

In each of our language SDKs, highlight.io supports manually sending errors. This is useful for reporting errors that are not caught by the SDK, or that you would like to define internally as your own application errors. 

In javascript, we support this via the `H.consumeError` method (see our SDK docs) and in other languages, we maintain this naming convention (pending casing conventions of the language in question.).