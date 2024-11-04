---
title: Ruby SDK API Reference
slug: ruby
---

<section className="section">
  <div className="left">
    <h3>Ruby SDK</h3>
    <p>
      Highlight's [Ruby SDK](https://rubygems.org/gems/highlight_io) makes it easy to monitor errors and logs on your Ruby backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/06_ruby/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.init()</h3>
    <p>Initializes the Highlight backend SDK.</p>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>project_id</code></h5>
      <p>Set the project ID for highlight.</p>
      <h5><code>environment</code> <code>optional</code></h5>
      <p>Set an environment name to report.</p>
      <h5><code>otlp_endpoint</code> <code>optional</code></h5>
      <p>The OpenTelemetry endpoint URL.</p>
      <h5><code>&block</code> <code>optional</code></h5>
      <p>A block for additional configuration.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        Highlight.init('1jdkoe52', environment: Rails.env, otlp_endpoint: 'http:\//localhost:4318') do |c|
          c.service_name = 'highlight-ruby-demo-backend'
          c.service_version = '1.0.0'
        end
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.start_span()</h3>
    <p>Starts a new span with the given name and attributes.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>name <code>string</code> <code>required</code></h5>
      <p>The name of the span.</p>
      <h5>&block <code>required</code></h5>
      <p>The block of code to be executed within the span.</p>
    </aside>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>attrs</code> <code>optional</code></h5>
      <p>A hash of attributes to add to the span.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        Highlight.start_span('pages-home-fetch') do
          uri = URI.parse('http:\//www.example.com/?test=1')
          response = Net::HTTP.get_response(uri)
          @data = response.body
        end
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.log()</h3>
    <p>Logs a message with the specified level and attributes.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>level <code>string</code> <code>required</code></h5>
      <p>The log level.</p>
      <h5>message <code>string</code> <code>required</code></h5>
      <p>The log message.</p>
    </aside>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>attrs</code> <code>optional</code></h5>
      <p>Additional attributes to include with the log.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        Highlight.log('info', 'hello, world!', { foo: 'bar' })
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>Highlight.exception()</h3>
    <p>Records an exception with optional attributes.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error <code>string</code> <code>required</code></h5>
      <p>The exception object to be recorded.</p>
    </aside>
    <h6>Options</h6>
    <aside className="parameter">
      <h5><code>attrs</code> <code>optional</code></h5>
      <p>Additional attributes to include with the exception.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        Highlight.exception(e, { foo: 'bar' })
    </code>
  </div>
</section>
