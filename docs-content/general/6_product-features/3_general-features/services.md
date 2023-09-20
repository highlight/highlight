---
title: Services
slug: services
createdAt: 2023-09-18T18:05:43.021Z
updatedAt: 2023-09-18T18:05:43.021Z
---

Services are a useful tool to group your logs, errors, and traces. Errors and logs can be filtered out by services, while also providing more context to the source of the code, especially in shared code paths.
In order to create a new service, a service name must be provided to your SDK configuration. Reference the [SDK start up guides](../../../getting-started/1_overview.md) for more help.

For example, in Golang, the following SDK will create a new service named "my-app":
```
highlight.SetProjectID("<YOUR_PROJECT_ID>")
highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
)
defer highlight.Stop()
```

Created services are visible at https://app.highlight.io/settings/services.

![Service's page](/images/features/services.png)