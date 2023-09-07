---
title: Enhancing Errors with GitHub
slug: enhancing-errors-with-github
createdAt: 2023-09-07T16:07:50.273Z
updatedAt: 2023-09-07T16:07:50.273Z
---

Highlight has to capability to enhance your backend errors using GitHub. On the frontend, errors are enhanced using sourcemaps uploaded to Highlight. Some backend
languages will give us context of a stacktrace, but for most compiled languages, there is no access to this. Using GitHub, these stacktraces are able to get this
context, as well as other enhancements such as link directly to a file in GitHub and attributing errors to file changes.


In order to turn on GitHub Enhancements, 3 actions need to be completed for your project:
<ol>
  <li>1. Add the GitHub Integration to Highlight</li>
  <li>2. Create a service via the SDK</li>
  <li>3. Link your service to a GitHub repo</li>
</ol>

## Add the GitHub Integration to Highlight
Enable GitHub on Highlight by going to the [integrations](https://app.highlight.io/integrations) and click the "Connect" button in the GitHub section.

More information on the GitHub Integration can be found at [GitHub Integration](../../7_integrations/github-integration.md).

## Create a service via the SDK
Services are created to group your logs, errors, and traces by the process that is running the code. Having a service can make it helpful to decipher
which process caused an error, especially in code paths shared by multuple processes. They can also be used also filters for logs and traces.

In order to create a new service, a service name must be added to your SDK. Reference the [SDK start up guides](../../../getting-started/1_overview.md) for more help.

For example, in Golang, it would look something like:
```
highlight.SetProjectID("<YOUR_PROJECT_ID>")
highlight.Start(
    highlight.WithServiceName("my-app"),
    highlight.WithServiceVersion("git-sha"),
)
defer highlight.Stop()
```

<b>Note:</b> There is also a service version that is provided in the example above. It is not necessary to enable GitHub enhancements, but is recommended that this be the current GIT SHA of the deployed code to use the most accurate files. If not provided, Highlight will fallback to your current default branch (e.g. main) GIT SHA.

## Link your service to a GitHub repo
Once a service is created, it should be visible in your project settings, under the "Services" table. The last step to enable stacktrace enhancements is to link your service to a GitHub repo, the one that should be used to enhance your errors. In addition to linking the repo, there are two fields to set configure any file path mappings from your deployment process that would be needed to correctly find a file on GitHub.

1. <b>Build path prefix</b> - This path prefix was added in your deployment process, and is the path in your server that contains your files. This path is not found in GitHub,
and should be removed when fetching the file.
2. <b>GitHub path prefix</b> - This path prefix was removed in your deployment process, and should be prepended to your files in order to correctly find the file on GitHub.

An example:
<ol>
    <li>1. An error received has a stacktrace that points to the file `/build/main.go`.</li>
    <li>2. The GitHub repo was selected to be the Highlight repo.</li>
    <li>3. Highlight's deployment process, move's all files out of the `/backend` directory and into a `/build` directory.</li>
    <li>4. We would set "Build prefix path" to `/backend` and GitHub prefix path to `/backend`.</li>
</ol>
This will result in the following mapping: 
`/build/main.go` -> [https://github.com/highlight/highlight/blob/HEAD/backend/main.go](https://github.com/highlight/highlight/blob/HEAD/backend/main.go).

## Having Issues?
You may notice your service is in an "error" state, and is no longer attempting to enhance errors. This may be due to a bad configuration when linking your service to a repo. If this does not seem to be the case, please reach out to us in our [discord community](https://highlight.io/community).
