---
title: Migrating from Highlight.io to LaunchDarkly Observability
createdAt: 2025-04-23T12:00:00.000Z
readingTime: 7
authorFirstName: Jay
authorLastName: Khatri
authorTitle: 'Co-founder & CEO'
authorTwitter: 'https://x.com/theJayKhatri'
authorLinkedIn: 'https://www.linkedin.com/in/jay-khatri/'
authorPFP: 'https://ca.slack-edge.com/T01AEDTQ8DS-U01A88AV6TU-4f7b4e7d637a-512'
authorGithub: 'https://github.com/jay-khatri'
authorWebsite: 'https://jaykhatri.com/'
tags: Company, Product Updates
metaTitle: Migrating from Highlight.io to LaunchDarkly Observability
---

![](/images/joining-launchdarkly.png)

## TLDR

All of the Highlight.io features you know and love are now available in the LaunchDarkly Observability product. Highlight.io will be deprecating services on **February 28th, 2026** and moving 100% of our infrastructure and services to LaunchDarkly.

Instead of logging into https://app.highlight.io, we recommend creating a new account and migrating your SDK snippets to use LaunchDarkly Observability (at https://app.launchdarkly.com). Customers will need to update their Highlight SDK Snippet to use LaunchDarkly before **March 1, 2026** to avoid any disruption of service.

If you have any questions about the process please reference the FAQ below! If you don't see your question answered, feel free to contact the team at observability@launchdarkly.com.

## Migration Example (JS)

### Before

```javascript
H.init('YOUR_PROJECT_ID', {
    privacySetting: 'none',
    networkRecording: {
        enabled: true,
        recordHeadersAndBody: true,
    },
    tracingOrigins: ['pri.highlight.io'],
    enableCanvasRecording: true,
    samplingStrategy: {
        canvas: 1,
        canvasFactor: 0.5,
        canvasMaxSnapshotDimension: 480,
    },
    serviceName: 'web',
    environment: 'env',
    version: 'version',
})
```

### After

```javascript
const client = initialize('LD_CLIENT_SIDE_ID', {user: {key: 'abc123', email: 'bob@example.com'}}, {
    plugins: [
        new Observability({
            tracingOrigins: ['pri.highlight.io'],
            networkRecording: {
                enabled: true,
                recordHeadersAndBody: true,
            },
            serviceName: 'web',
            environment: 'env',
            version: 'version',
        }),
        new SessionReplay({
            privacySetting: 'none',
            enableCanvasRecording: true,
            samplingStrategy: {
                canvas: 1,
                canvasFactor: 0.5,
                canvasMaxSnapshotDimension: 480,
            },
            contextFriendlyName: (ctx) => ctx.user.email,
            serviceName: 'web',
            environment: 'env',
            version: 'version',
        }),
    ],
})
```

## FAQ

**Q: Will my pricing change?**

LaunchDarkly's self-serve pricing tiers are the Developer and Foundation plans.

The **Developer plan** is $0 per month, and includes the following (monthly recurring) allotments:
- 3 service connections (for feature flagging)
- 5,000 sessions
- 5,000 errors
- 10,000,000 logs
- 10,000,000 traces
- No "overages"

The **Foundation plan** is $36 per month, and includes:
- 3 service connections (for feature flagging)
- 5,000 sessions
- 5,000 errors
- 10,000,000 logs
- 10,000,000 traces

For any "overages" above the limits described above, the Observability pricing within LaunchDarkly will follow the self-serve pricing described [here](https://launchdarkly.com/pricing/).

**Q: When will services officially end on Highlight.io?**

February 28, 2026

**Q: Will I need to migrate my existing data in Highlight to LaunchDarkly?**

Not necessarily. But if you would like to migrate your existing data / configuration, please reach out to our team at observability@launchdarkly.com.

**Q: Do I need to purchase a new LaunchDarkly self-serve license?**

On LaunchDarkly self-serve plans, if you exceed the free tier limits for any of the LaunchDarkly products, you will be expected to accept LaunchDarkly's licensing terms and (like in Highlight) pay for any monthly overages.

**Q: Can I connect my observability data to LaunchDarkly feature flags?**

Yes! LaunchDarkly observability connects to the rest of the LD platform. Feature flags, experiments, AI Observability and more!

**Q: If I want to learn more about Feature Flagging how do I get connected?**

We are happy to connect you to the appropriate LaunchDarkly representative. Email observability@launchdarkly.com for more.

**Q: I am already a LaunchDarkly customer. What does this mean for me?**

If you are already a usage based self-service customer of LD, you are one step ahead in the process. You will still need to change your SDK snippet to send data to your current account. If you're an enterprise customer, please reach out to observability@launchdarkly.com for more information.

**Q: Will my invoicing date change?**

Yes, LaunchDarkly invoices on a calendar month cadence.
