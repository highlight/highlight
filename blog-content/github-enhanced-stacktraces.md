---
title: 'Building GitHub Enhanced Stacktraces'
createdAt: 2023-10-13T00:25:04.236Z
readingTime: 5
authorFirstName: Spencer
authorLastName: Amarantides
authorTitle: Software Engineer @ Highlight
authorTwitter: 'https://twitter.com/SpennyNDaJets'
authorLinkedIn: 'https://www.linkedin.com/in/spencer-amarantides/'
authorGithub: 'https://github.com/SpennyNDaJets'
authorWebsite: ''
authorPFP: 'https://lh3.googleusercontent.com/a/AAcHTteOYM6knTAD-uOPM1JP56Yn4WlsGya6Dpnhq_ak6UJUY3Q=s576-c-no'
tags: Developer Tooling, Launch Week 3
metaTitle: Enhance your backend errors with code directly from GitHub
---

Do you enjoy seeing the code responsible for causing an error on your frontend stack traces? Do you wish you could see the same context
on your backend stack traces? Now you can with GitHub enhanced stacktraces!

Frontend errors are able to enhance the stack trace with your sourcemaps. Most backed languages are compiled, causing us to miss out
on those direct code mappings. As a result, the stack traces of you backend errors appear empty and lack the context to debug an error
from the Highlight app. Until now! Highlight developed a solution to provide you with the extra context on your backend errors, so you
can triage, debug, and solve more efficiently.

![GitHub enhancement](/images/blog/github-enhanced-stacktraces/enhancement.png)

## How it works

Highlight's backend error enhancement relies on GitHub. With your permission, we use the the GitHub repo linked to your service, to fetch
the correct file from GitHub. Then using the line number of the stack trace, we can rebuild the lost context of each file in the trace of
the error.

It's simple right? Yes, but it does require some configuration on your side. In most build processes, the file names in the stack trace
cannot be fetched directly from GitHub. Files tend to be copied from directories, and moved into other directories from deployment. In
order to successfully enhance the file, Highlight needs to know what these paths are. We try to make this easy by allowing you to test
your configuration directly on an error, providing you with immediate feedback (See below). Once you are successful, just save and
forget about it. Your errors will start being enhanced!

![GitHub configuration settings](/images/blog/github-enhanced-stacktraces/configuration-form.png)

For more detailed instructions to getting started, see [Enhancing Errors with GitHub](../docs-content/general/6_product-features/2_error-monitoring/enhancing-errors-with-github.md)

## Diving deeper

Your repo is rate limited by GitHub, so we tried to minimize the amount of requests with a few strategies. First, any files we fetch from
GitHub we "cache" in AWS S3, to avoid needing to refetch the same file multiple times. This is cached with a Git Sha commit hash, so if your requested
Git Sha changes, the file will be refetched, insuring the latest changes are displayed.

Which Git Sha does Highlight use? That depends. Ideally, the Git Sha will be provided to the Highlight SDK, using the `serviceVersion` field.
If you provide this field, you can ensure that you are looking at the correct code ran at the time of the error. However, this is not a
blocker to using the enhancement feature. If no version is provided to the SDK, Highlight will fetch the latest Git Sha commit hash from
your default branch. The hash is cached for a day, so there is a small chance you may be viewing a stale version, but it will correct itself
over time.

Lastly, this is only the start to enhancing errors with GitHub. Already we can add context to compiled languages and link directly to the file in GitHub.
We are looking to surpass what we can enhance with sourcemap, and start using these enhancments on all errors in your application. GitHub can allow
you to see the history of a file, git blames (sorry in advanced to my fellow Highlight devs), and be able to link the start of an error to a specific
code commit. If you have any feedback on how the feature works or future improvement, don't hesistate to reach out to us on [discord](https://highlight.io/community).