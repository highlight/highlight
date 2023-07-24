---
title: Changelog 20 (06/06)
slug: changelog-20
---

<EmbeddedVideo 
  src="https://www.youtube.com/embed/3t5d8Jyg044"
  title="Youtube"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
/>

## User management features

Spencer Amarantides joined our team last week and has already shipped his first feature!

We can now create, view and delete Highlight team invites.

![pending invites](/images/changelog/20/pending-invites.png)

And the email that invited users receive is now cleaner and easier to understand.
![invite email](/images/changelog/20/invite-email.png)

## New Logging connectors

-   [AWS Kinesis](../../getting-started/backend-logging/5_hosting/aws.md#aws-kinesis-firehose-for-logs-from-infrastructure-or-other-services)

-   [Fluent Forward](../../getting-started/backend-logging/9_fluentforward.md)
-   [Filesystem](../../getting-started/backend-logging/8_file.md)
-   [Loguru](../../getting-started/backend-logging/3_python/loguru.md)

These new connectors make Highlight much easier to use with AWS, Docker, custom VMs and Python!

We've long supported Open Telemetry's logging protocol, but now we also support Fluent Forward, which will make working with AWS and other Fluent-Forward-compatible systems much easier.
