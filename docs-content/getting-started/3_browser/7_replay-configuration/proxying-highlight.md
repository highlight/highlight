---
title: Proxying Highlight
slug: proxying-highlight
createdAt: 2021-10-11T21:13:07.000Z
updatedAt: 2022-01-27T19:51:23.000Z
---

```hint
Proxying is only available on our [Business Plan](https://highlight.io/pricing). If you would like use this, please reach out to sales@highlight.io.


```

If you're not seeing sessions or errors on Highlight, chances are that requests to Highlight are being blocked. This can happen for different reasons such as a third-party browser extensions, browser configuration, or VPN settings.

One way we can avoid this is by setting up proxy from your domain to Highlight. To do this, you will need access to your domain's DNS settings.

## Setting up the proxy

1.  On your domain, add a `CNAME` record that points `highlight.<YOUR_DOMAIN>` to `pub.highlight.run`.

2.  Send us an email at sales@highlight.io so we can send over a cost proposal for your annual usage.


Below is an example email/message that you can send over.

> Hello!
>
> I'd like to use the Highlight Proxy and I'm interested in an annual plan. I've set up an CNAME record for: highlight.piedpiper.com

### Example

You have an app running on `https://piedpiper.com`. Your DNS record will point `highlight.piedpiper.com` to our backend.

## Using the Proxy

In your app where you call [H.init()](../../../sdk/client.md#Hinit), you will need to set `backendUrl` to the DNS record you just created. For the example above:

```javascript
H.init('<YOUR_PROJECT_ID>', {
  backendUrl: 'https://highlight.piedpiper.com',
})
```

You should now see Highlight making requests to `https://highlight.piedpiper.com` instead of `https://pub.highlight.run`.
