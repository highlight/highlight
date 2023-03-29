---
title: Golang SDK API Reference
slug: go
---

<section className="section">
  <div className="left">
    <h3>Golang SDK</h3>
    <p>
      Highlight's [Golang SDK](https://pypi.org/project/highlight-io/) makes it easy to monitor errors and logs on your Golang backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](https://google.com) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.Start()</h3> 
    <p>Starts the background goroutine for transmitting metrics and errors.</p>
  </div>
  <div className="right">
    <code>
        H.Start()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.StartWithContext()</h3> 
    <p>StartWithContext is used to start the Highlight client's collection service, 
but allows the user to pass in their own context.Context. 
This allows the user kill the highlight worker by canceling their context.CancelFunc.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The context provided for starting the Highlight daemon.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        ctx := context.Background()
        ...
        H.startWithContext(ctx)
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.Stop()</h3> 
    <p>Stop the Highlight client. Does not wait for all un-flushed data to be sent.</p>
  </div>
  <div className="right">
    <code>
        H.Stop()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.SetProjectID()</h3> 
    <p>Configure your Highlight project ID. See the [setup page for your project](https://app.highlight.io/setup).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>id <code>string</code> <code>required</code></h5>
      <p>The project ID.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        H.SetProjectID("YOUR_PROJECT_ID")
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.RecordError()</h3> 
    <p>Record errors thrown in your backend.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from H.InterceptRequest().</p>
      <h5>err <code>error</code> <code>required</code></h5>
      <p>The error to report.</p>
     <h5>tags <code>...struct{Key: string, Value: string}</code> <code>optional</code></h5>
      <p>Additional tags to identify this error.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        ctx := context.Background()
        result, err := myOperation(ctx)
        if err != nil {
            H.RecordError(ctx, err)
        }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.RecordMetric()</h3> 
    <p>Record metrics from your backend to be visualized in Highlight charts.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from H.InterceptRequest().</p>
      <h5>name <code>string</code> <code>required</code></h5>
      <p>The metric name.</p>
      <h5>value <code>float64</code> <code>required</code></h5>
      <p>The metrics value.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        start := time.Now()
        defer func() {
            H.RecordMetric(
                ctx, "my.operation.duration-s", time.Since(start).Seconds(),
            )
        }()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.InterceptRequest()</h3> 
    <p>Called under the hood by our middleware web backend handlers to extract the request context.
Use this if you are using the raw http server package and need to setup the Highlight context.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>r <code>*http.Request</code> <code>required</code></h5>
      <p>The incoming request.</p>
      <h5>ctx <code>context.Context</code> <code>optional</code></h5>
      <p>The incoming request context. Use InterceptRequestWithContext if you have an existing context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        func Middleware(next http.Handler) http.Handler {
            fn := func(w http.ResponseWriter, r *http.Request) {
                ctx := highlight.InterceptRequest(r)
                r = r.WithContext(ctx)
                highlight.MarkBackendSetup(r.Context())
                next.ServeHTTP(w, r)
            }
            return http.HandlerFunc(fn)
        }
    </code>
  </div>
</section>
