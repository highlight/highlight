---
title: Next.JS SDK API Reference
slug: nextjs
quickstart: true
---

<section className="section">
  <div className="left">
    <h3>Next.js SDK</h3>
    <p>
      Highlight's Next.js SDK makes it easier to configure your Next.js app for session recording. It ships with helper functions to upload frontend source maps, proxy your Highlight requests, and monitor errors and metrics on your backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/3_client-sdk/2_nextjs.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight</h3> 
    <p>Highlight() generates a function that you can use to wrap your API handlers to provide backend error monitoring. If an error is thrown during the handler's execution, it is sent to Highlight and linked to the frontend session which caused the error. Typically, you would configure any necessary settings, and then export a common wrapper you can use to wrap all of your API handlers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options <code>NodeOptions</code> <code>optional</code></h5>
      <p>The configuration for Highlight backend monitoring.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>projectID <code>boolean</code> <code>required</code></h5>
          <p>Your Highlight project ID.</p>
        </aside>
        <aside className="parameter">
          <h5>disableErrorSourceContext <code>boolean</code> <code>optional</code></h5>
          <p>Disables source code context lines for error reporting. This may be useful for performance if your source files are particularly large or memory is limited.</p>
        </aside>
        <aside className="parameter">
          <h5>errorSourceContextCacheSizeMB <code>number</code> <code>optional</code></h5>
          <p>Source files are cached in memory to speed up error reporting and avoid costly disk access. The default cache size is 10MB, but this can be overridden. Specifying a value <= 0 removes all cache size limits.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      import { PageRouterHighlight } from "@highlight-run/next/server";
 
      export const withPageRouterHighlight = PageRouterHighlight({projectID: '<YOUR_PROJECT_ID>'});
    </code>
    <code>
      import { withPageRouterHighlight } from "../highlight.config";
 
      const handler = async (req, res) => {
        res.status(200).json({ name: "Jay" });
      };
 
      export default withPageRouterHighlight(handler);
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>withHighlightConfig</h3> 
    <p>You can wrap your next.config.js settings with this function to automatically configure source map uploading and creating a rewrite to proxy Highlight requests. This function sets productionBrowserSourceMaps=true, adds a rewrite rule to return HTTP 404 for any .map files (to keep source map files private), uploads source maps to Highlight following any production build, and adds a rewrite rule from /highlight-events to pub.highlight.run for Highlight request proxying</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>uploadSourceMaps <code>boolean</code> <code>optional</code></h5>
      <p>Explicitly enable or disable source map uploading during production builds. By default, source maps are uploaded if both NextConfig.productionBrowserSourceMaps is not true and the API key is set through the apiKey option or HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>configureHighlightProxy <code>boolean</code> <code>optional</code></h5>
      <p>Configures a rewrite at /highlight-events for proxying Highlight requests.</p>
    </aside>
    <aside className="parameter">
      <h5>apiKey <code>string</code> <code>optional</code></h5>
      <p>API key used to link to your Highlight project when uploading source maps. This can also be set through the HIGHLIGHT_SOURCEMAP_UPLOAD_API_KEY environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>appVersion <code>string</code> <code>optional</code></h5>
      <p>App version used when uploading source maps.</p>
    </aside>
    <aside className="parameter">
      <h5>serviceName <code>string</code> <code>optional</code></h5>
      <p>Name of your app.</p>
    </aside>
    <aside className="parameter">
      <h5>sourceMapsPath <code>string</code> <code>optional</code></h5>
      <p>The file system root directory containing all your source map files.</p>
    </aside>
    <aside className="parameter">
      <h5>sourceMapsBasePath <code>string</code> <code>optional</code></h5>
      <p>Base path to append to your source map URLs when uploaded to Highlight.</p>
    </aside>
    <aside className="parameter">
      <h5>sourceMapsBackendUrl <code>string</code> <code>optional</code></h5>
      <p>Backend url for private graph to use for uploading (for self-hosted highlight deployments).</p>
    </aside>
  </div>
  <div className="right">
    <code>
      
      import { withHighlightConfig } from "@highlight-run/next/config";
      export default withHighlightConfig({
        // your next.config.js options here

        // Note, withHighlightConfig works for Next version 
        // >= v12.1.0. withHighlightConfig returns a promise, 
        // which may be incompatible with other Next.js 
        // config generators that have not been well maintained.
      })
    </code>
  </div>
</section>
