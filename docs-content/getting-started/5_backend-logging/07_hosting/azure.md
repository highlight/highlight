---
title: Logging in Azure
slug: azure
createdAt: 2022-03-28T20:31:15.000Z
updatedAt: 2022-04-06T20:22:54.000Z
---

Deploying your application or infrastructure in Microsoft Azure? Stream your logs to highlight to see everything in one place.

Check out the following examples of setting up logs streaming in these services:

## Azure Logging

1. Setup the [Azure Event Hubs](https://learn.microsoft.com/en-us/azure/event-hubs/event-hubs-create) to enable streaming logs. 
![](/images/azure/step1.png)
![](/images/azure/step1b.png)

2. Create an [Azure Function triggered by Event Hubs](https://learn.microsoft.com/en-us/azure/azure-functions/functions-bindings-event-hubs-trigger?tabs=python-v2%2Cin-process%2Cfunctionsv2%2Cextensionv5&pivots=programming-language-csharp) that will forward logs to highlight.
![](/images/azure/step2.png)
![](/images/azure/step2b.png)

3. Configure the Azure Function with the following Node.js code, updating the values for `PROJECT_ID` and `SERVICE`:
```typescript
// Unless explicitly stated otherwise all files in this repository are licensed
// under the Apache License Version 2.0.

var https = require("https");

const PROJECT_ID = process.env.PROJECT_ID || "<YOUR_PROJECT_ID>";
const SERVICE = process.env.SERVICE || "azure";

const MAX_RETRIES = 4; // max number of times to retry a single http request
const RETRY_INTERVAL = 250; // amount of time (milliseconds) to wait before retrying request, doubles after every retry

class HTTPClient {
  constructor(context) {
    this.context = context;
    this.httpOptions = {
      hostname: "pub.highlight.io",
      path: "/v1/logs/json",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-highlight-project": PROJECT_ID,
        "x-highlight-service": SERVICE
      }
    };
  }

  async sendAll(records) {
    const promises = [];
    for (let i = 0; i < records.length; i++) {
      promises.push(this.send(records[i]));
    }
    return await Promise.all(
      promises.map(p => p.catch(e => this.context.log.error(e)))
    );
  }

  isStatusCodeValid(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
  }

  shouldStatusCodeRetry(statusCode) {
    // don't retry 4xx responses
    return (
      !this.isStatusCodeValid(statusCode) &&
      (statusCode < 400 || statusCode > 499)
    );
  }

  send(record) {
    var numRetries = MAX_RETRIES;
    var retryInterval = RETRY_INTERVAL;
    return new Promise((resolve, reject) => {
      const sendRequest = (options, record) => {
        const retryRequest = errMsg => {
          if (numRetries === 0) {
            return reject(errMsg);
          }
          this.context.log.warn(
            `Unable to send request, with error: ${errMsg}. Retrying ${numRetries} more times`
          );
          numRetries--;
          retryInterval *= 2;
          setTimeout(() => {
            sendRequest(options, record);
          }, retryInterval);
        };
        const req = https
          .request(options, resp => {
            if (this.isStatusCodeValid(resp.statusCode)) {
              resolve(true);
            } else if (
              this.shouldStatusCodeRetry(resp.statusCode)
            ) {
              retryRequest(
                `invalid status code ${resp.statusCode}`
              );
            } else {
              reject(`invalid status code ${resp.statusCode}`);
            }
          })
          .on("error", error => {
            retryRequest(error.message);
          })
          .on("timeout", () => {
            req.destroy();
            retryRequest(
              `request timed out`
            );
          });
        req.write(JSON.stringify({ message: record, timestamp: new Date().getTime(), level: 'log' }));
        req.end();
      };
      sendRequest(this.httpOptions, record);
    });
  }
}

module.exports = async function(context, eventHubMessages) {
  if (!PROJECT_ID || PROJECT_ID === "<YOUR_PROJECT_ID>") {
    context.log.error("Please configure the highlight project ID.");
    return;
  }
  var results = await new HTTPClient(context).sendAll(eventHubMessages);

  if (results.every(v => v === true) !== true) {
    context.log.error("An error occurred sending some messages");
  }
};

```
![](/images/azure/step3a.png)

Click on Integration then Azure Event Hubs under trigger and check the following settings:
   a. Event Parameter Name is set to eventHubMessages.
   b. Event Hub Cardinality is set to Many.
   c. Event Hub Data Type is left empty.
![](/images/azure/step3b.png)

4. Enable Azure service diagnostic settings in the Activity Log to send logs to the Event Hub, which in turn will be streamed to highlight by the function created in step 3.
![](/images/azure/step4.png)


At this point, your infrastructure / service logs (for which you enabled the diagnostic setting) should show up in [highlight](https://app.highlight.io/logs)!
