---
title: Salesforce Lightning Web Components (LWC)
slug: salesforce-lwc
createdAt: 2024-06-25T22:55:19.000Z
updatedAt: 2023-08-22T21:51:00.000Z
---

## Monitoring and Debugging Salesforce Lightning Web Components (LWC)

Highlight.io makes it easy to monitor and debug Salesforce Lightning Web Components (LWC) applications. With a few lines of code you can:

- Capture and replay user sessions
- Identify and reproduce bugs quickly
- Monitor performance metrics
- Gain insights into user behavior

This integration works seamlessly with Salesforce LWC, requiring minimal changes to your existing codebase. The following guide will walk you through setting up highlight.io for monitoring your Salesforce LWC application.

## Salesforce Installation Instructions

To install highlight.io in a Salesforce application, follow the [normal highlight HTML installation instructions](../8_other.md) while performing additional steps to set up the [content security policy](./content-security-policy.md) to allow execution of the highlight script.

### Configure the Head Markup

1. Navigate to Setup -> Digital Experiences -> and select the Builder of your choice
2. Open the Head Markup editor in Builder | Settings | Advanced
3. Add the `<script src="https://unpkg.com/highlight.run"></script>` tag.
4. Add another `<script></script>` with the `H.init` contents as described on our [normal highlight HTML installation instructions](../8_other.md).
5. Save the contents of the Head Markup.

![Add head markup initializing Highlight in Salesforce](/images/docs/salesforce/step1.png)

### Configure the CSP Policy

1. Open the Security and Privacy menu in Builder | Settings.
2. Set `Security Level` to `Relaxed`
3. Under Trusted Sites, click the +Add Trusted Site button, and as necessary.

![Update security level in Salesforce](/images/docs/salesforce/step2.png)
![Update Content Security Policy (CSP) in Salesforce](/images/docs/salesforce/step3.png)

### Configure Trusted URLs

1. Open the Trusted URLs menu in Builder | Settings | Setup.
2. Add a New Trusted URL

![Access trusted URLs in Salesforce](/images/docs/salesforce/step4.png)
![Update trusted URLs in Salesforce](/images/docs/salesforce/step5.png)
