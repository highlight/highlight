---
title: Enhancing Errors with GitHub
slug: enhancing-errors-with-github
createdAt: 2023-09-07T16:07:50.273Z
updatedAt: 2023-09-07T16:07:50.273Z
---

Highlight has the capability to enhance your backend errors using GitHub (errors on the frontend are enhanced using [sourcemaps](./sourcemaps.md)). With our GitHub
integration, Highlight is able to enhance a stacktrace with context, as well as other enhancements such as "link to a file" and attribution to a code change.


In order to turn on GitHub Enhancements, 3 actions need to be completed for your project:
<ol>
  <li>1. Create a service via the SDK</li>
  <li>2. Add the GitHub Integration to Highlight</li>
  <li>3. Link your service to a GitHub repo</li>
</ol>

## Create a service via the SDK
Services are created to group your logs, errors, and traces by the application that is running the code. Having a service can make it helpful to decipher
which application caused an error, especially in code paths shared by multiple applications. They can also be used also filters for logs and traces.

Services are created by passing in a service name via the SDK. For example, in Golang, the following SDK will create a new service named "my-app":
```
highlight.SetProjectID("<YOUR_PROJECT_ID>")
highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
)
defer highlight.Stop()
```

Reference the [SDK start up guides](../../../getting-started/1_overview.md) for more help. For more information about services, see [Services documentation](../../6_product-features/3_general-features/services.md).

<b>Note:</b> There is also a service version that is provided in the example above. This is not necessary to enable GitHub enhancements, but is recommended that this be the
current GIT SHA of the deployed code to use the most accurate files. If not provided, Highlight will fallback to your current default branch (e.g. main) GIT SHA.

## Add the GitHub Integration to Highlight
Enable GitHub on Highlight by going to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the GitHub section.

More information on the GitHub Integration can be found at [GitHub Integration](../../7_integrations/github-integration.md).

## Link your service to a GitHub repo
Once a service is created, the service will be visible in the metadata of your error. The last step to enable stacktrace enhancements is to link your service to
its respective GitHub repo, the one that should be used to enhance your errors. In addition to linking the repo, there are two fields to configure file path mappings from your
deployment process to the correct file in GitHub.

1. <b>Build path prefix</b> - This path prefix represents a path added in your deployment process, and is also the path in your server that contains your files.
After removing this path (and possibly adding something else), you should be able to point this string to a GitHub file.
2. <b>GitHub path prefix</b> - This path prefix is a string that can be appended to the front of the stacktracepath, and will be prepended to your files in order to correctly find the file in GitHub.

It is recommended to complete with the form while viewing an error, to be able to test your configuration on the viewed error. This can also be completed from the [services table](https://app.highlight.io/settings/services), where all your services can be viewed and managed.

![Service Configuration Form](/images/features/enhancingErrorsWithGithub.png)

An example:
<ol>
    <li>1. An error received has a stacktrace path `/build/main.go`.</li>
    <li>2. The GitHub repo was selected to be the [Highlight repo](https://github.com/highlight/highlight).</li>
    <li>3. Since Highlight's deployment process moves all files out of the `/backend` directory and into the `/build` directory, we would set "Build prefix path"
    to `/backend` and GitHub prefix path to `/backend`.</li>
</ol>
This will result in the following mapping: 
`/build/main.go` -> [https://github.com/highlight/highlight/blob/HEAD/backend/main.go](https://github.com/highlight/highlight/blob/HEAD/backend/main.go).

## Having Issues?
You may notice your service is in an "error" state, and is no longer attempting to enhance errors. This may be due to a bad configuration when linking your service to a repo. If this does not seem to be the case, please reach out to us in our [discord community](https://highlight.io/community).
