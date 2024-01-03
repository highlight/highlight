---
title: Recording Network Requests and Responses
slug: recording-network-requests-and-responses
createdAt: 2021-09-14T00:14:21.000Z
updatedAt: 2023-10-25T15:40:08.873Z
---

Highlight out of the box shows you all the network requests durations, response codes, and sizes for a session. If you'd like more data such as the headers and bodies, you can enable recording of network requests and responses by setting `networkRecording.recordHeadersAndBody` (see [NetworkRecordingOptions](../../../sdk/client.md#Hinit)) to `true` when initializing Highlight.

Highlight monkey patches `XmlHttpRequest` and `fetch` to record data from your app's requests/responses including status codes, headers, and bodies.

## Privacy

Out of the box, Highlight will not record known headers that contain secrets. Those headers are:
\- `Authorization`
\- `Cookie`
\- `Proxy-Authorization`

If you have other headers that you would like to redact then you can set `networkRecording.networkHeadersToRedact`.

## Recording Headers and Bodies

Highlight can also record the request/response headers and bodies. You'll be able to see the headers and bodies by clicking on any XHR or Fetch requests in the session Developer Tools.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
  },
})
```

## Redacting URLs

You may have APIs that you know will always return secrets in the headers, body, or both. In this case, you can choose URLs to redact from. If a URL matches one of the URLs you specify, the header and body will not be recorded.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: true,
  urlBlocklist: [
    'https://salted-passwords.com',
    'https://www.googleapis.com/identitytoolkit',
    'https://securetoken.googleapis.com',
  ],
})
```

Out of the box, Highlight will not record these URLs:
\- `https://www.googleapis.com/identitytoolkit`
\- `https://securetoken.googleapis.com`

## Redacting Headers and Bodies

If you are dealing with sensitive data or want to go the allowlist approach then you can configure `networkRecording.headerKeysToRecord` and `networkRecording.bodyKeysToRecord`. Using these 2 configs, you'll be able to explicitly define which header/body keys to record.

You can also redact specific headers by using `networkRecording.networkHeadersToRedact` and redact specific keys in the request/response body with `networkRecoding.networkBodyKeysToRedact`.

This configuration is only available for `highlight.run` versions newer than `4.1.0`.

## Custom Sanitizing of Response and Requests

Create a sanitize function to gain granular control of the data that your client sends to Highlight. The sanitize function is defined in the second argument of `H.init` under `networkRecording.requestResponseSanitizer`.

The `networkRecording.requestResponseSanitizer` method receives a Request/Response pair, and should return an object of the same type or a `null` value. Returning a `null` value means that Highlight will drop the request, and no related network logs will be seen in the session replay.

Dropping logs is not recommended unless necessary, as it can cause issues with debugging due to the missing requests. Rather, it is recommended to delete or redact header and body fields in this method.

This configuration is only available for `highlight.run` versions newer than `8.1.0`.

```typescript
H.init('<YOUR_PROJECT_ID>', {
  networkRecording: {
    enabled: true,
    recordHeadersAndBody: true,
    requestResponseSanitizer: (pair) => {
      if (pair.request.url.toLowerCase().indexOf('ignore') !== -1) {
        // ignore the entire request/response pair (no network logs)
        return null
      }
	 
      if (pair.response.body.indexOf('secret') !== -1) {
        // remove the body in the response
        delete pair.response.body;
      }
	 
      return pair
    }
  },
})
```

## API

See [NetworkRecordingOptions](../../../sdk/client.md) for more information on how to configure network recording.

## GraphQL

We extract GraphQL operation names and format the payloads. See [GraphQL details](../../../general/6_product-features/1_session-replay/graphql.md).
