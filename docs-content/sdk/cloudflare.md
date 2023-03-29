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
    <h3>H.consumeError</h3> 
    <p>H.consumeError() reports an error and its corresponding stack trace to Highlight. The session is inferred based on the incoming network request headers.</p>
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
              try {
                  // do something...
                  return new Response('hello!')
              } catch (e: any) {
                  H.consumeError(request, { HIGHLIGHT_PROJECT_ID: 'YOUR_PROJECT_ID' }, ctx, e)
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
              const response = return new Response('hello!')
              H.sendResponse(request, { HIGHLIGHT_PROJECT_ID: 'YOUR_PROJECT_ID' }, ctx, response)
              return response
          },
      }
    </code>
  </div>
</section>
