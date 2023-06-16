# RFC: Testing Strategy

* Status: In Progress
* Author: [@Vadman97](https://github.com/Vadman97)

## Summary

Testing software at highlight means validating that features 
used by customers meet and exceed their expectations.
These feature span our SDKs, the app.highlight.io frontend, 
and the backend and associated serverless functions. 

When we build features or make changes, we have a few ways to
validate that our implementation matches desired behavior. 
This RFC discusses what we do today and what we could do in the future 
to continue to impress our customers.

Because of the early nature of our company, **we prioritize shipping features quickly**
and iterating with enhancements, rather than guaranteeing correctness of every code change. 
However, while quick iteration works well for new product development, it is often a challenge 
to make quick changes to existing software components. This is because they are often more complex
yet already 'stable', so there aren't many bugs but a lot of opportunity to break important
behavior. This RFC proposes the incremental addition of unit/functional testing to our
coding practices to build a base of automated tests that can help prevent regressions in the future.

## Motivation

To understand why we are interested in improving our testing strategy, 
consider the following example of a change to our session ingest code. 
We recently made changes to the metadata updates performed when processing `PushPayload` messages.
The [change](https://github.com/highlight/highlight/pull/5252) added logic around evaluating whether sessions are excluded.

Correctness of the code associated with processing `PushPayload` messages is critical to the
product. At the same time, the code path is difficult to test manually because there are a number
of nested conditions that are hard to hit during a short manual session recording. Moreover, the
code is complex and is infrequently changed, so engineers do not have the full context on the
associated code when jumping in to make changes.

## Proposed Implementation

## Success Metrics

## Drawbacks

## Alternatives

## Open Questions

## Rollout

## Tasks
