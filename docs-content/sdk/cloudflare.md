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
    <p>Check out our [getting started guide](../getting-started/4_server/2_js/cloudflare.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3>
    <p>H.init() configures the highlight SDK and records console log methods. The session/trace context is inferred based on the incoming network request headers.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>env<code>{ HIGHLIGHT_PROJECT_ID: string }</code> <code>required</code></h5>
      <p>The Highlight project ID for routing errors.</p>
    </aside>
    <aside className="parameter">
      <h5>service<code>string</code> <code>optional</code></h5>
      <p>The application service name.</p>
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
    <h3>H.runWithHeaders</h3>
    <p>H.runWithHeaders() traces a response from your backend. This allows tracking incoming and outgoing headers and bodies and automatically propagating the trace context to child spans.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>span_name<code>string</code> <code>required</code></h5>
      <p>The name for this parent span.</p>
    </aside>
    <aside className="parameter">
      <h5>headers<code>Headers</code> <code>required</code></h5>
      <p>The request headers to infer the application context.</p>
    </aside>
    <aside className="parameter">
      <h5>fn<code>Function</code> <code>required</code></h5>
      <p>The function to invoke for this request that will be traced.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      import { H } from '@highlight-run/cloudflare'
      async function doRequest() {
        const someHost = 'https://highlight.io'
        const url = someHost + '/index.js'
        async function gatherResponse(response: any) {
          H.setAttributes({ foo: 'bar', random: Math.random() })
          console.log('yo! gathering a cloudflare worker response', {
            another: Math.random(),
            bar: 'bar',
          })
          console.warn('warning! gathering a cloudflare worker response', {
            bar: 'warning',
          })
          console.warn('error! gathering a cloudflare worker response', {
            another: Math.random(),
          })
          if (Math.random() < 0.2) {
            throw new Error('random error from cloudflare worker!')
          }
          const { headers } = response
          const contentType = headers.get('content-type') || ''
          if (contentType.includes('application/json')) {
            return JSON.stringify(await response.json())
          } else if (contentType.includes('application/text')) {
            return response.text()
          } else if (contentType.includes('text/html')) {
            return response.text()
          } else {
            return response.text()
          }
        }
        const init = {
          headers: {
            'content-type': 'text/html;charset=UTF-8',
          },
        }
        const response = await fetch(url, init)
        const results = await gatherResponse(response)
        return new Response(results, init)
      }
      export default {
        async fetch(request: Request, env: {}, ctx: ExecutionContext) {
          H.init({ HIGHLIGHT_PROJECT_ID: '1' }, 'e2e-cloudflare-app')
          try {
            return await H.runWithHeaders('worker', request.headers, doRequest)
          } catch (e: any) {
            H.consumeError(e)
            throw e
          }
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
              H.init({ HIGHLIGHT_PROJECT_ID: '1' }, 'example-cloudflare-service')
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
