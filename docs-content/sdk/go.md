---
title: Go SDK API Reference
slug: go
---

<section className="section">
  <div className="left">
    <h3>Go SDK</h3>
    <p>
      Highlight's [Go SDK](https://pkg.go.dev/github.com/highlight/highlight/sdk/highlight-go) makes it easy to monitor errors and logs on your Go backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/01_go/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.Start()</h3>
    <p>Starts the background goroutine for transmitting metrics and errors.</p>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>WithProjectID</code></h5>
      <p>Set the project ID for highlight. Can also be set with a highlight.SetProjectID call.</p>
      <h5><code>WithEnvironment</code> <code>optional</code></h5>
      <p>Set an environment name to report.</p>
      <h5><code>WithSamplingRate</code> <code>optional</code></h5>
      <p>Set a fractional sampling rate for traces to ingest.</p>
      <h5><code>WithServiceName</code> <code>optional</code></h5>
      <p>The name of your app.</p>
      <h5><code>WithServiceVersion</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        highlight.Start(
            highlight.WithProjectID("<YOUR_PROJECT_ID>"),
            highlight.WithSamplingRate(1.),
            highlight.WithServiceName("my-app"),
            highlight.WithServiceVersion("git-sha"),
            highlight.WithEnvironment(util.EnvironmentName()),
        )
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.StartWithContext()</h3>
    <p>StartWithContext is used to start the Highlight client's collection service, 
but allows the user to pass in their own context.Context. 
This allows the user kill the highlight worker by canceling their context.CancelFunc.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The context provided for starting the Highlight daemon.</p>
    </aside>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>WithServiceName</code> <code>optional</code></h5>
      <p>The name of your app.</p>
      <h5><code>WithServiceVersion</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        ctx := context.Background()
        ...
        highlight.startWithContext(ctx,
          highlight.WithServiceName("my-app"),
          highlight.WithServiceVersion("git-sha"),
        )
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.Stop()</h3>
    <p>Stop the Highlight client. Does not wait for all un-flushed data to be sent.</p>
  </div>
  <div className="right">
    <code>
        highlight.Stop()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.SetProjectID()</h3>
    <p>Configure your Highlight project ID. See the [setup page for your project](https://app.highlight.io/setup).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>id <code>string</code> <code>required</code></h5>
      <p>The project ID.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        highlight.SetProjectID("<YOUR_PROJECT_ID>")
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.RecordError()</h3>
    <p>Record errors thrown in your backend.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from highlight.InterceptRequest().</p>
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
            highlight.RecordError(ctx, err)
        }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.RecordMetric()</h3>
    <p>Record metrics from your backend to be visualized in Highlight charts.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>ctx <code>context.Context</code> <code>required</code></h5>
      <p>The request context which should have highlight parameters set from highlight.InterceptRequest().</p>
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
            highlight.RecordMetric(
                ctx, "my.operation.duration-s", time.Since(start).Seconds(),
            )
        }()
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.InterceptRequest()</h3>
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

<section className="section">
  <div className="left">
    <h3>highlight.NewGraphqlTracer()</h3>
    <p>An http middleware for tracing GraphQL servers.</p>
    <h6>Configuration</h6>
    <aside className="parameter">
      <h5>highlight.NewGraphqlTracer().WithRequestFieldLogging()</h5>
      <p>Emits highlight logs with details of each graphql operation.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        server.Use(highlight.NewGraphqlTracer(string(util.PrivateGraph)).WithRequestFieldLogging())
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.GraphQLRecoverFunc()</h3>
    <p>A gqlgen recover function to capture panics.</p>
    <h6>Configuration</h6>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        server.SetRecoverFunc(highlight.GraphQLRecoverFunc())
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>highlight.GraphQLErrorPresenter()</h3>
    <p>A gqlgen error presenter.</p>
    <h6>Configuration</h6>
    <aside className="parameter">
      <h5>service<code>string</code> <code>required</code></h5>
      <p>The name of the service.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        import ghandler "github.com/99designs/gqlgen/graphql/handler"
        privateServer := ghandler.New(privategen.NewExecutableSchema(...)
        privateServer.SetErrorPresenter(highlight.GraphQLErrorPresenter("private"))
    </code>
  </div>
</section>
