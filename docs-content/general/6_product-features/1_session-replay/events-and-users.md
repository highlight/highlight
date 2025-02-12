---
title: Tracking Users & Recording Events
slug: welcome-to-highlight
---

## Identifying Users & Tracking Events

With session replay, it can be useful to identify the actual users and track actions that they perform. By default, your users in [highlight.io](https://highlight.io) remain anonymous, but we offer the option to identify and track actions with our javascript SDK. Read more in our [SDK Configuration](../../../getting-started/3_browser/7_replay-configuration/1_overview.md) guide.

![](/images/user-info.png)

## Definition of a Session

A highlight session starts when you `H.init` in your web application (or call `H.start` if you are manually delaying the recording start). Once a session starts, we will continue recording in the same session for up to 4 hours. Each browser tab / instance will start a distinct session, so if your web app is opened in 2 tabs at once, we will record 2 sessions. 

However, once a session starts, it can be resumed. If your web app is opened in a single tab, closed, and then reopened within 15 minutes of closing, we will resume the existing highlight session. If more than 15 minutes have passed, we will start a new session.

**Active time** is the time when a user is interacting with your page with no more than a 10-second gap in activity. For example, if a user is moving their mouse / typing / clicking for 30 seconds with no gaps of longer than 10 seconds, that would count as 30 seconds of active time.
