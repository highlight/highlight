---
title: Extracting the Session URL
headline: The Session URL
slug: session-url
---

In some cases, you may want to extract the Session URL at the time that a user visits your web application to send it your other tools. For example, if you have a customer support tool, many customers like to sent the session URL of their customers to the tool in order to help them debug their issues. 

You can do this by using the the `H.getSessionDetails` method. This method will return an object with a `url` and `urlWithTimestamp` property. Usage is as follows:

```js
      H.getSessionDetails().then(({url, urlWithTimestamp}) => {
          console.log(url, urlWithTimestamp);
      });
```

Please refer to our [SDK docs](../../../sdk/client.md) for more information.