---
title: Hono SDK API Reference
slug: hono
quickstart: true
---

<section className="section">
  <div className="left">
    <h3>Hono SDK</h3>
    <p>
      Highlight's Hono SDK makes it easy to monitor errors and requests in your Hono applications by providing middleware that automatically traces requests and reports errors.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/03_js/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlightMiddleware</h3>
    <p>Creates a Hono middleware that automatically traces requests and reports errors to Highlight.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options <code>NodeOptions</code> <code>required</code></h5>
      <p>The configuration for Highlight backend monitoring. See the full [NodeOptions API reference](../sdk/nodejs.md#options) for all available options.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>projectID <code>string</code> <code>required</code></h5>
          <p>Your project ID as provided by the [setup page](https://app.highlight.io/setup).</p>
        </aside>
        <aside className="parameter">
          <h5>serviceName <code>string</code> <code>optional</code></h5>
          <p>The name of your app.</p>
        </aside>
        <aside className="parameter">
          <h5>serviceVersion <code>string</code> <code>optional</code></h5>
          <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      import { Hono } from 'hono'
      import { highlightMiddleware } from '@highlight-run/hono'

      const app = new Hono()

      app.use(highlightMiddleware({
        projectID: '<YOUR_PROJECT_ID>',
        serviceName: 'my-hono-app',
      }))

      app.get('/', (c) => {
        return c.text('Hello Highlight!')
      })

      export default app
    </code>
  </div>
</section>
