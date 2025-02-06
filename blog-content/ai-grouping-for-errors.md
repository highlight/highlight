---
title: LLM-based Grouping of Errors
createdAt: 2023-10-16T00:00:00.000Z
readingTime: 7
authorFirstName: Vadim
authorLastName: Korolik
authorTitle: Co-Founder & CTO
authorTwitter: 'https://twitter.com/vkorolik'
authorLinkedIn: 'https://www.linkedin.com/in/vkorolik/'
authorGithub: 'https://github.com/Vadman97'
authorWebsite: 'https://vadweb.us'
authorPFP: >-
  https://lh3.googleusercontent.com/a-/AOh14Gh1k7XsVMGxHMLJZ7qesyddqn1y4EKjfbodEYiY=s96-c
image: /images/blog/ai-grouping-for-errors/error-main-2.png
tags: 'Engineering, Observability'
metaTitle: 'Day 5: Our Partners & Supporters'
---

Highlight offers full stack visibility into errors happening in your application. Often though, it's difficult to differentiate real errors that impact your user experience from noise or other expected errors. To help sift out inconsequential errors from actionable ones, we now group and tag errors using the insights of a trained language learning model. We'll be covering how we did this and how it works with this high level overview.

Our goal was to build two features: (1) tagging errors (e.g. deeming an error as "authentication error" or a "database error"); and (2) grouping similar errors together (e.g. two errors that have a different stacktrace and body, but are semantically not very different).

Each of these rely heavily on comparing text across our application. After some experimentation with the [OpenAI embeddings API](https://platform.openai.com/docs/guides/embeddings), we went ahead and hosted a private model instance of thenlper/gte-large (an open-source MIT licensed model), which is a 1024-dimension model running on an Intel Ice Lake 2 vCPU machine on [Hugging face](https://huggingface.co/thenlper/gte-large).

Our general approach for classifying/comparing text is as follows. As each set of tokens (i.e a string) comes in, our backend makes a request to an inference endpoint and receives a 1024-dimension float vector as a response (see [the code here](https://github.com/highlight/highlight/blob/ad0ac46ec237dfe35b3f7ee41323ca6a9ad6d2e1/backend/embeddings/embeddings.go#L194-L231)). We then store that [vector using pgvector](https://github.com/highlight/highlight/blob/ad0ac46ec237dfe35b3f7ee41323ca6a9ad6d2e1/backend/model/model.go#L1013-L1019). To compare any two sets for similarity, we simply look at the Euclidian distance between their respective embeddings using the ivfflat index implemented by pgvector ([example code here](https://github.com/highlight/highlight/blob/ad0ac46ec237dfe35b3f7ee41323ca6a9ad6d2e1/backend/public-graph/graph/resolver.go#L494-L502)).

To tag errors, we assign an error its most relevant tag from a predetermined configurable set. For example, if we tag an error as an "authentication error" or a "database error", we can allow developers to have a starting point before inspecting an issue.([see the logic here](https://github.com/highlight/highlight/blob/ad0ac46ec237dfe35b3f7ee41323ca6a9ad6d2e1/backend/private-graph/graph/resolver.go#L3538-L3547)).

Anecdotally, this approach seems to work very well. For example, here are two authentication errors that got tagged as "Authentication Error":

    * Firebase: A network AuthError has occurred
    * Error retrieving user from firebase api for email verification: cannot find user from uid.

We also use these error embeddings to group similar errors. To decide whether an error joins a group or starts a new one, we decide on a distance threshold (using the euclidean distance) ahead of time. An interesting thing about this approach, compared to using a text-based heuristic, is that two errors with different stack traces can still be grouped together. Here's an example:

    * `github.com/highlight-run/highlight/backend/worker.(*Worker).ReportStripeUsage`
    * `github.com/highlight-run/highlight/backend/private-graph/graph.(*Resolver).GetSlackChannelsFromSlack.func1`

Both reported as `integration api error` as they involve the Stripe and Slack integrations respectively. The neat thing is that the LLM can use the full context of an error and match based on the most relevant details about the error.
We have rolled out a first version of the error grouping logic to [our cloud product](https://app.highlight.io), and there's [a demo of all the functionality](https://app.highlight.io/error-tags). Long-term, if the HN community has other ideas of what we could build with LLM tooling in observability, we're all ears. Let us know what you think!
