---
title: Introducing The New Timeline Indicator
createdAt: 2022-11-08T12:00:00.000Z
readingTime: 5
authorFirstName: Sasha
authorLastName: Aptlin
authorTitle: Software Engineer
authorTwitter: 'https://twitter.com/aptlin'
authorLinkedIn: 'https://linkedin.com/in/aptlin'
authorGithub: 'https://github.com/aptlin'
authorWebsite: ''
authorPFP: >-
  https://www.highlight.io/_next/image?url=https%3A%2F%2Fmedia.graphassets.com%2FYLhOFZBtQbaAycTzbVFx&w=3840&q=75
tags: Engineering
metaTitle: Introducing The New Timeline Indicator
---

Today, the Timeline Indicator gets a major revamp in Highlight, helping users navigate a session to find and fix issues faster than ever.

The new Timeline Indicator in Highlight is a visualization of all the events that occur over the course of a session, be it clicks, reloads, or any other actions you [_decide to track_](https://www.highlight.io/docs/session-replay/tracking-events "https://www.highlight.io/docs/session-replay/tracking-events"), and enables gestures for quick navigation: pinch to zoom and swipe to go back and forth.

![Timeline-Indicator-UI-1 (2).gif](https://media.graphassets.com/U1gvjVk0QhCmvBYL4ATO "Timeline-Indicator-UI-1 (2).gif")

## **Grouped Events**

Previously, Highlight had events appear as colored dots on the timeline, no matter how many of them were in a session. For long sessions with a lot of user activity, this made debugging and analysis confusing and time-consuming.

Now events are easier to digest. Rather than representing events as dots, we group events into buckets that you can interact with: click on them to see all the events in the time slot of interest.

And getting all the context you need for a particular event has never been easier. You can navigate to individual events to check out console logs, errors and network requests that happened at that particular moment.

![Timeline-Indicator-UI-4 (1).gif](https://media.graphassets.com/C5e3VQqRPO7vYc2AVUFh "Timeline-Indicator-UI-4 (1).gif")

The area chart on the top gives you an idea where you are in the session even after zooming into a session segment. Instead of gestures, you can also use the draggable session monitor to refine your focus.

![Timeline-Indicator-UI-2.gif](https://media.graphassets.com/ZyqzwtjT9WhiEToxz7tH "Timeline-Indicator-UI-2.gif")

## **New keyboard shortcuts**

Power users can now use keyboard shortcuts to customize their workflow: hide the timeline, open the dev tools or change the replay speed all without touching the mouse.

You can see them by hovering over buttons, or pressing ? to open a list of all available shortcuts.

![fff.png](https://media.graphassets.com/QZlNc1QASHW49u9vpKgf "fff.png")

## **Player performance**

With this launch, we’ve also put a lot of focus into the performance (and perceived performance) of our player. But using a combination of CSS animations & transitions, as well as making changes to our replay infrastructure, playing back a session in Highlight has never been smoother.

## **Try the new Timeline Indicator**

The new Timeline Indicator is live for all users. [_Login to Highlight_](https://app.highlight.io/ "https://app.highlight.io/"), open a session, and try it out today!
