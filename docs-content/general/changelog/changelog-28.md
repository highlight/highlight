---
title: Changelog 28 (3/6)
slug: changelog-28
---

## Related Resources

No error takes place in a vacuum.

Highlight is built around the concept of connecting all of your sessions, errors, logs, and traces.

We're tightening up that integrated approach by detecting those connections proactively. Now, when you're investigating an error, you'll see buttons for related sessions, logs, and traces.

If those buttons are active, you can click through to see the related resource and dig deeper into the error's cause.

And of course, we have similar buttons on our Session Replay page, as well as links back to the relevant session from the Traces page.

![Related Resources buttons](/images/changelog/28/related-resources.png)

## Search query evolution

Search is a large problem set, and we're continuing to chip away at it.

- Instead of skipping whitespace in our grammar, we push it to a hidden channel allowing us to still get tokens for whitespace from the lexer.
- We updated the logic for creating the visual tags around filters. This enables us to handle the grouping better visually even though the parser can't break things into expressions for us.
- We moved the display of the errors above the search input.
- The token causing an error now receives a red background.

![Query shortcuts](/images/changelog/28/query-shortcuts.png)

## Relate logs back to traces

Each new span that the Highlight system instantiates in your code path will include a `traceId`.

That `traceId` helps relate a span to all activity that occurs during its lifecycle, particularly the creation of child spans.

Highlight now tags logs with their nearest `traceId` as well, closing the loop between logs and traces.

![Log with traceId](/images/changelog/28/log-with-trace-id.png)