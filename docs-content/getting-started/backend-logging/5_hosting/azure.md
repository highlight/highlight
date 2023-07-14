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
   
3. Enable Azure service diagnostic settings to send logs to the Event Hub, which in turn will be streamed to highlight by the function created in step 2.
![](/images/azure/step3.png)


At this point, your infrastructure / service logs should show up in [highlight](https://app.highlight.io/logs)!
