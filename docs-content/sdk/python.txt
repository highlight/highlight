---
title: Python SDK API Reference
slug: python
---

<section className="section">
  <div className="left">
    <h3>Python SDK</h3>
    <p>
      Highlight's [Python SDK](https://pypi.org/project/highlight-io/) makes it easy to monitor errors and logs on your Python backend.
    </p>
  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/4_backend-sdk/05_python/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H()</h3>
    <p>H() initializes the Highlight backend SDK.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>project_id<code>string</code> <code>required</code></h5>
      <p>The id of your project from app.highlight.io/setup</p>
    </aside>
    <aside className="parameter">
      <h5>integrations<code>List[Integration]</code> <code>optional</code></h5>
      <p>A list of integration instances.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">Integration properties</aside>
        <aside className="parameter">
          <h5><code>highlight_io.integrations.Integration</code> <code>optional</code></h5>
          <p>Use FlaskIntegration() for [Flask](https://flask.palletsprojects.com/en/2.2.x/) apps.</p>
          <p>Use DjangoIntegration() for [Django](https://www.djangoproject.com/) apps.</p>
          <p>Use FastAPIMiddleware for [FastAPI](https://fastapi.tiangolo.com/) apps.</p>
        </aside>
      </article>
    </aside>
    <aside className="parameter">
      <h5>disabled_integrations<code>List[Integration]</code> <code>optional</code></h5>
      <p>A list of integrations to disable.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">Default integrations</aside>
        <aside className="parameter">
          <h5><code>highlight_io.integrations.Integration</code> <code>optional</code></h5>
          <p>RequestsIntegration() for the [Requests](https://requests.readthedocs.io/en/latest/) library.</p>
        </aside>
      </article>
    </aside>
    <aside className="parameter">
      <h5>instrument_logging<code>boolean</code> <code>optional</code></h5>
      <p>If enabled, Highlight will record log output from the logging module.</p>
    </aside>
    <aside className="parameter">
      <h5>service_name<code>string</code> <code>optional</code></h5>
      <p>The name of your app.</p>
    </aside>
    <aside className="parameter">
      <h5>service_version<code>string</code> <code>optional</code></h5>
      <p>The version of this app. We recommend setting this to the most recent deploy SHA of your app.</p>
    </aside>
    <aside className="parameter">
      <h5>environment<code>string</code> <code>optional</code></h5>
      <p>Specifies the environment your application is running in. This helpful to differentiate if your project is running in production or locally.</p>
    </aside>
  </div>
  <div className="right">
    In Flask, you'll add Highlight in your main app.py entrypoint.
    <code>
        import highlight_io
        from highlight_io.integrations.flask import FlaskIntegration
        app = Flask('test-app')
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          integrations=[FlaskIntegration()],
          instrument_logging=True,
          service_name="my-flask-app",
          service_version="git-sha", 
          environment="production"
        )
    </code>
    In Django, you'll add Highlight to your settings.py file:
    <code>
        import highlight_io
        from highlight_io.integrations.django import DjangoIntegration
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          integrations=[DjangoIntegration()],
          instrument_logging=True,
          service_name="my-django-app",
          service_version="git-sha",
          environment="production"
        )
    </code>
    In FastAPI, you'll add Highlight as a middleware:
    <code>
        import highlight_io
        from highlight_io.integrations.fastapi import FastAPIMiddleware
        H = highlight_io.H(
          "<YOUR_PROJECT_ID>",
          instrument_logging=True,
          service_name="my-fastapi-app",
          service_version="git-sha",
          environment="production"
        )
        app = FastAPI()
        app.add_middleware(FastAPIMiddleware)
    </code>
  </div>
</section>
<section className="section">
  <div className="left">
    <h3>H.record_exception()</h3> 
    <p>Record arbitrary exceptions raised within your app.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>e <code>Exception</code> <code>optional</code></h5>
      <p>The exception to record. The contents and stacktrace will be recorded.</p>
    </aside>
    <aside className="parameter">
      <h5>attributes <code>dict[str, any]</code> <code>optional</code></h5>
      <p>Metadata to associate with this exception.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        try:
          for i in range(20):
            result = 100 / (10 - i)
            print(f'dangerous: {result}')
        except Exception as e:
          H.record_exception(e)
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.trace()</h3> 
    <p>Catch exceptions raised by your app using this context manager.
Exceptions will be recorded with the Highlight project and
associated with a frontend session when headers are provided. Exceptions
will be re-raised in case you want to have them propagate.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>session_id <code>string</code> <code>optional</code></h5>
      <p>A Highlight session ID that the request is being made from. If omitted, 
the error will be associated with the project ID passed to H().</p>
    </aside>
    <aside className="parameter">
      <h5>request_id <code>string</code> <code>optional</code></h5>
      <p>A Highlight network request ID that initiated the handler raising this error.</p>
    </aside>
    <aside className="parameter">
      <h5>attributes <code>dict[str, any]</code> <code>optional</code></h5>
      <p>Metadata to associate with this exception.</p>
    </aside>
  </div>
  <div className="right">
    <code>
        with H.trace(span_name="my_span"):
            for idx in range(1000):
                logging.info(f"hello {idx}")
                time.sleep(0.001)
                if random.randint(0, 100) == 1:
                    raise Exception(f"random error! {idx}")
            logging.warning("made it outside the loop!")
    </code>
  </div>
</section>
