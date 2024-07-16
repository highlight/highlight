---
title: Salesforce Lightning Web Components (LWC)
slug: salesforce-lwc
createdAt: 2024-06-25T22:55:19.000Z
updatedAt: 2024-06-25T18:01:58.000Z
---

## Salesforce Lightning Web Components

Highlight will record the contents of lightning web components out of the box: no custom configuration needed.
You'll just need to make sure you're on the latest version of our browser SDK, which should by default be the case
when using our unpkg.com script.

## Salesforce Installation Instructions

To install highlight.io in a Salesforce application, follow the [normal highlight HTML installation instructions](../8_other.md) 
while performing additional steps to set up the [content security policy](./content-security-policy.md) 
to allow execution of the highlight script.

### Configure the Head Markup

1. Navigate to Setup -> Digital Experiences -> and select the Builder of your choice
2. Open the Head Markup editor in Builder | Settings | Advanced
3. Add the `<script src="https://unpkg.com/highlight.run"></script>` tag.
4. Add another `<script></script>` with the `H.init` contents as described on our [normal highlight HTML installation instructions](../8_other.md).
5. Save the contents of the Head Markup.

![](/images/docs/salesforce/step1.png)

### Configure the CSP Policy

1. Open the Security and Privacy menu in Builder | Settings.
2. Set `Security Level` to `Relaxed`
3. Under Trusted Sites, click the +Add Trusted Site button, and as necessary.

![](/images/docs/salesforce/step2.png)
![](/images/docs/salesforce/step3.png)

### Configure Trusted URLs

1. Open the Trusted URLs menu in Builder | Settings | Setup.
2. Add a New Trusted URL

![](/images/docs/salesforce/step4.png)
![](/images/docs/salesforce/step5.png)
