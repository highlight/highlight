---
title: Rage Clicks
slug: rage-clicks
createdAt: 2021-10-13T01:46:13.000Z
updatedAt: 2022-08-09T21:26:43.000Z
---

Rage clicks are the equivalent of spamming a close elevator button when you just want to get up to your apartment. But, instead of a close elevator button, it's a space on your application. And instead of getting to your apartment, users usually _rage click_ when a button isn't working as it should.

## How do we identify rage clicks?

A Rage Click is defined as a time periodic in which a user clicks the same area a certain number of times. This can help highlight points of frustration your users have with the app.

By default, we consider user activity as rage clicks when there exists a 2 second or longer period in which a user clicks 5 or more times within a radius of 8 pixels.

## Customizing rage click sensitivity

You'll find fine-grained control over your project's rage click settings in [your project settings page](https://app.highlight.io/settings).

- Elapsed Time (seconds): the maximum time interval during which clicks count toward a rage click.

- Radius (pixels): how close clicks must be to be determined as part of the same rage click.

- Minimum Clicks: the minimum number of nearby clicks required to count as a rage click.

![configuring rage click settings](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/0sgR-VlLcRpAl9SsbDfR-_image.png)

## Alerting for rage clicks

Create a rage click alert [within your project's alerts page](https://app.highlight.io/alerts) to be notified on Slack or via email about a user rage clicking in your app!

![creating a rage click alert](https://archbee-image-uploads.s3.amazonaws.com/XPwQFz8tul7ogqGkmtA0y/XxyLN8kFXtefRgFf1BBUI_image.png)
