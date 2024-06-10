---
title: Cloudflare Worker SDK API Reference
slug: cloudflare
---

<section className="section">
  <div className="left">
    <h3>Cloudflare Worker SDK</h3>
    <p>
      Highlight's Cloudflare Worker SDK lets you track your errors and responses in Cloudflare Workers
with no impact on performance..
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/js/cloudflare.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3>
    <p>H.init() configures the highlight SDK and records console log methods. The session is inferred based on the incoming network request headers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>request<code>Request</code> <code>required</code></h5>
      <p>The incoming Cloudflare request object.</p>
    </aside>
    <aside className="parameter">
      <h5>env<code>{ HIGHLIGHT_PROJECT_ID: string }</code> <code>required</code></h5>
      <p>The Highlight project ID for routing errors.</p>
    </aside>
    <aside className="parameter">
      <h5>ctx<code>ExecutionContext</code> <code>required</code></h5>
      <p>The Cloudflare execution context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              // do something...
              console.log('hi!', {hello: 'world'})
              return new Response('hello!')
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.consumeError</h3>
    <p>H.consumeError() reports an error and its corresponding stack trace to Highlight. The session is inferred based on the incoming network request headers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error<code>Error</code> <code>required</code></h5>
      <p>The exception to report as part of this request.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              try {
                  // do something...
                  return new Response('hello!')
              } catch (e: any) {
                  H.consumeError(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx, e)
                  throw e
              }
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.sendResponse</h3>
    <p>H.sendResponse() traces a response from your backend. This allows tracking incoming and outgoing headers and bodies.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>response<code>Request</code> <code>required</code></h5>
      <p>The response to record.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              const response = new Response('hello!')
              H.sendResponse(response)
              return response
          },
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.setAttributes</h3>
    <p>H.setAttributes() attached structured log attributes to all subsequent console methods. Repeat calls with the same key update the value.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>attributes<code>Attributes</code> <code>required</code></h5>
      <p>An object of key: value pairs to set as structured log attributes.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from "@highlight-run/cloudflare";
      export default {
          async fetch(request: Request, env: {}, ctx: ExecutionContext) {
              H.init(request, { HIGHLIGHT_PROJECT_ID: '<YOUR_PROJECT_ID>' }, ctx)
              // do something...
              console.log('hi!', {hello: 'world'})
              H.setAttributes({my: 'attribute', is: Math.random()})
              console.warn('whoa')
              return new Response('hello!')
          },
      }
    </code>
  </div>
</section>
