---
title: Setup
slug: setup
createdAt: 2021-09-17T21:48:44.000Z
updatedAt: 2021-09-17T21:56:27.000Z
---

There are no requirements or dependencies to test the highlight.io data source in our demo environment.

To use this data source for your cloud-managed project, you must be an enterprise customer. If you're interested in getting this set up, please reach out to us at [support@highlight.io](mailto:support@highlight.io).

## Installation
We're working to add the highlight.io plugin to the Grafana plugin catalog - in the meantime, it can be installed manually as an unsigned plugin. 

You can download the plugin [here](https://highlight-client-bundle.s3.us-east-2.amazonaws.com/assets/grafana/highlightinc-highlight-datasource.zip) and unzip it to a folder named `highlightinc-highlight-datasource` in the plugins directory on your Grafana instance (usually `data/plugins/`).

Grafana won't run unsigned plugins by default. To allow Grafana to run our unsigned plugin, you can add the following setting to your `grafana.ini`:

```javascript
allow_loading_unsigned_plugins = highlightinc-highlight-datasource
```

## Configuration
Once you have installed the highlight.io plugin, you can add a new data source and configure it with these fields:

![Configuration](/images/docs/grafana/configuration.png)

|Name|Description|
|----|-----------|
|`Highlight Backend URL`|The URL used to query highlight.io data. If you are using cloud-managed highlight.io, set this to `https://pri.highlight.io`.|
|`OAuth Token URL`|The URL used to retrieve an OAuth access token. If you are using cloud-managed highlight.io, set this to `https://pri.highlight.io/oauth/token`.|
|`Project ID`|The highlight.io project ID, accessible from the URL slug of your highlight.io project, e.g. `https://app.highlight.io/{project_id}/`. If you want to query data from multiple projects, you can set up multiple data sources. To query the demo project, set this to 1344.|
|`Client ID`|If you are using cloud-managed highlight.io, set this to your OAuth client ID. If you are setting up the data source for the first time and need a client ID, reach out to us at [support@highlight.io](mailto:support@highlight.io). If you are self-hosting highlight.io or using the demo project, leave this blank.|
|`Client Secret`|If you are using cloud-managed highlight.io, set this to your OAuth client secret. If you are setting up the data source for the first time and need a client secret, reach out to us at [support@highlight.io](mailto:support@highlight.io). If you are self-hosting highlight.io or using the demo project, leave this blank.|

With these fields filled out, `Save & test` will run a health check to verify that the data source is able to query highlight.io data.
