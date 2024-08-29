---
title: Client SDK API Reference
slug: client
---

<section className="section">
  <div className="left">
    <h3>Client SDK</h3>
    <p>
      The Highlight client records and sends session data to Highlight. The Highlight client SDK contains functions to configure your recording, start and stop recording, and add custom user metadata and properties.
    </p>

  </div>
  <div className="right">
    <h6>Just getting started?</h6>
    <p>Check out our [getting started guide](../getting-started/1_overview.md) to get up and running quickly.</p>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.init</h3>
    <p>This method is called to initialize Highlight in your application.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>projectId<code>String</code> <code>optional</code></h5>
      <p>The projectId tells Highlight where to send data to. You can find your projectId on https://app.highlight.io/setup. If projectId is not set, then Highlight will not send any data. You can use this as a mechanism to control which environments Highlight gets initialized in if the projectId is passed as an environment variable.</p>
    </aside>
    <aside className="parameter">
      <h5>options <code>HighlightOptions</code> <code>optional</code></h5>
      <p>Configuration for Highlight client recording.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>backendUrl <code>string</code> <code>optional</code></h5>
          <p>Specifies the URL that Highlight will send data to. You should not use this unless you are running an on-premise instance. You may be interested in [Proxying](../getting-started/3_client-sdk/7_replay-configuration/proxying-highlight.md) to make sure your errors and sessions are not blocked by extensions.</p>
        </aside>
        <aside className="parameter">
          <h5>manualStart <code>boolean</code> <code>optional</code></h5>
          <p>Specifies if Highlight should not automatically start recording when the app starts. This should be used with H.start()  and H.stop() if you want to control when Highlight records. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>disableConsoleRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight records console messages. It can be helpful to set this to true while developing locally so you can see where console messages are being made in your source code. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>consoleMethodsToRecord <code>string[]</code> <code>optional</code></h5>
          <p>The value here will be ignored if disabledConsoleRecording is true. The default value is ['assert', 'count', 'countReset', 'debug', 'dir', 'dirxml', 'error', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log', 'table', 'time', 'timeEnd', 'timeLog', 'trace', 'warn'].</p>
        </aside>
        <aside className="parameter">
          <h5>reportConsoleErrors <code>boolean</code> <code>optional</code></h5>
          <p>If true, console.error calls will be logged as errors. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>enableSegmentIntegration <code>boolean</code> <code>optional</code></h5>
          <p>Allows patching of segment requests to enhance data automatically in your application (i.e. identify, track, etc.). The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>environment <code>string</code> <code>optional</code></h5>
          <p>Specifies the environment your application is running in. See [Environments](../general/6_product-features/3_general-features/environments.md) to see how setting the environment can help you move faster. The default value is production.</p>
        </aside>
        <aside className="parameter">
          <h5>networkRecording <code>NetworkRecordingOptions</code> <code>optional</code></h5>
          <p>Specifies how and what network requests and responses Highlight records. See [Recording Network Requests and Responses](../getting-started/3_client-sdk/7_replay-configuration/recording-network-requests-and-responses.md) for more information.</p>
        </aside>
        <aside className="parameter">
          <h5>version <code>string</code> <code>optional</code></h5>
          <p>Specifies the version of your application. See [Versioning Sessions](../getting-started/3_client-sdk/7_replay-configuration/versioning-sessions-and-errors.md) and [Versioning Errors](../getting-started/3_client-sdk/7_replay-configuration/versioning-sessions-and-errors.md) to see how setting the version can help you move faster.</p>
        </aside>
        <aside className="parameter">
          <h5>serviceName <code>string</code> <code>optional</code></h5>
          <p>Specifies the name of your application.</p>
        </aside>
        <aside className="parameter">
          <h5>privacySetting <code>'strict' | 'default' | 'none'</code> <code>optional</code></h5>
          <p>Specifies how much of the content Highlight should redact during recording. There are 3 levels of privacy:
          1. 'strict' - Redact all text and images on the page. This is the safest way to ensure you are not recording any personally identifiable information without having to manually add annotations to elements you don't want to be recorded.
          2. 'default' - Highlight will redact any text or input data that matches common regex expressions and input names of personally identifiable information. No images or media will be redacted.
          3. 'none' - All text and content will be recorded as it is displayed on the page.
          See [Privacy](../getting-started/3_client-sdk/7_replay-configuration/privacy.md) to learn more about the privacy options. The default value is 'default'.</p>
        </aside>
        <aside className="parameter">
          <h5>integrations <code>IntegrationOptions</code> <code>optional</code></h5>
          <p>Specifies the configurations for the integrations that Highlight supports.</p>
        </aside>
        <aside className="parameter">
          <h5>enableCanvasRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight will record the contents of &lt;canvas&gt; elements. See [Canvas](../getting-started/3_client-sdk/7_replay-configuration/canvas.md) for more information. The default value is false.</p>
        </aside>
        <aside className="parameter">
          <h5>enablePerformanceRecording <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether Highlight will record performance metrics (e.g. FPS, device memory).</p>
        </aside>
        <aside className="parameter">
          <h5>tracingOrigins <code>boolean | (string | RegExp)[]</code> <code>optional</code></h5>
          <p>Specifies where the backend of the app lives. If specified, Highlight will attach the X-Highlight-Request header to outgoing requests whose destination URLs match a substring or regexp from this list, so that backend errors can be linked back to the session. If true is specified, all requests to the current domain will be matched. Example tracingOrigins: ['localhost', /^\//, 'backend.myapp.com']</p>
        </aside>
        <aside className="parameter">
          <h5>recordCrossOriginIframe <code>boolean</code> <code>optional</code></h5>
          <p>Specifies that cross-origin iframe elements should be recorded. Should be set in both the parent window and in the iframe. See [cross-origin iframe recording](../getting-started/3_client-sdk/7_replay-configuration/iframes.md) for more details.</p>
        </aside>
        <aside className="parameter">
          <h5>urlBlocklist <code>string[]</code> <code>optional</code></h5>
          <p>Specifies a list of URLs to block <b>before</b> sending events to the Highlight back end. URLs can be fully-qualified or partial substring matches. Example: urlBlocklist: ["//www.high", "light.io"]</p>
        </aside>
        <aside className="parameter">
          <h5>inlineImages <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether to record image content. We default inlineImages to true on localhost and false on other domains. Inlined images that are otherwise only available on localhost can be sent to Highlight's servers and used in session replay; however, this can cause CORS errors. Explicitly set inlineImages to false to resolve CORS errors.</p>
        </aside>
        <aside className="parameter">
          <h5>inlineStylesheet <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether to inline CSS style tags into the recording. When not set, defaults to true which will inline stylesheets to make sure apps recorded from localhost or other non-public network endpoints can be replayed. Setting to false may help with CORS issues caused by fetching the stylesheet contents, as well as with performance issues caused by the inlining process.</p>
        </aside>
        <aside className="parameter">
          <h5>enableOtelTracing <code>boolean</code> <code>optional</code></h5>
          <p>
            Specifies whether the OpenTelemetry Browser instrumentation will be enabled for your project. Learn more in [Browser OpenTelemetry](../getting-started/3_client-sdk/7_replay-configuration/opentelemetry.md).
          </p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.init("&lt;YOUR_PROJECT_ID&gt;", {
          // Your config options here...
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.identify</h3>
    <p>This method is used to add an identity to a user for the session. You can learn more in [Identifying Users](../getting-started/3_client-sdk/7_replay-configuration/identifying-sessions.md).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>identifier<code>String</code> <code>required</code></h5>
      <p>The identifier for the user in the session. This is often an email or UUID.</p>
    </aside>
    <aside className="parameter">
      <h5>metadata<code>[key: string]: string | boolean | number</code> <code>optional</code></h5>
      <p>Metadata for the user. You can think of these as additional tags for the user. If the highlightDisplayName or email fields are set, they will be used instead of identifier as the user's display name on the session viewer and session feed.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.identify("alice@corp.com", {
          highlightDisplayName: "Alice Customer",
          accountType: "premium",
          hasUsedFeature: true
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.track</h3>
    <p>This method is used to track events that happen during the session. You can learn more in [Tracking Events](../getting-started/3_client-sdk/7_replay-configuration/tracking-events.md).</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>eventName<code>String</code> <code>required</code></h5>
      <p>The name of the event.</p>
    </aside>
    <aside className="parameter">
      <h5>metadata<code>[key: string]: string | boolean | number</code> <code>optional</code></h5>
      <p>Metadata for the event. You can think of these as additional tags for the event.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.track("Opened Shopping Cart", {
          accountType: "premium",
          cartSize: 10
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.consumeError</h3>
    <p>This method is used to send a custom error to Highlight.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>error<code>Error</code> <code>required</code></h5>
      <p>A Javascript error that you have created or have access to.</p>
    </aside>
    <aside className="parameter">
      <h5>message<code>string</code> <code>optional</code></h5>
      <p>An additional message you'd like to add to the error to give the error more context.</p>
    </aside>
    <aside className="parameter">
      <h5>payload<code>{ [key: string]: string }</code> <code>optional</code></h5>
      <p>Additional metadata that you'd like to attach to the error to give the error more context.</p>
    </aside>
  </div>
  <div className="right">
    <code>
      H.consumeError(error, 'Error in Highlight custom boundary!', {
        component: 'JustThroughAnError.tsx',
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.metrics</h3>
    <p>This method is used to submit custom metrics. </p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>metrics<code>Metrics[]</code> <code>required</code></h5>
      <p>A list of metrics that you'd like to report.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">metrics properties</aside>
        <aside className="parameter">
          <h5>name <code>string</code> <code>required</code></h5>
          <p>The name of the metric you are reporting.</p>
        </aside>
        <aside className="parameter">
          <h5>value <code>number</code> <code>required</code></h5>
          <p>The numeric value of the metric.</p>
        </aside>
        <aside className="parameter">
          <h5>tags <code>{ name: string; value: string }[]</code> <code>optional</code></h5>
          <p>A set of name,value pairs the represent tags about the metric. Tags can be used to filter and group metrics. See Frontend Observability for more details.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.metrics([{
        name: 'clicks',
        value: 1,
        tags: [{ browser }]
      }, {
        name: 'auth_time',
        value: authDelay,
        tags: [{ version: 'v2' }]
      }
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.getSessionDetails</h3>
    <p>This method is used to get the Highlight session URL. This method provides the same URL as H.getSessionUrl() but this also gives you a URL for the exact time (relative to the session recording) the method is called. For example, an error is thrown in your app and you want to save the Highlight session URL to another app (Mixpanel, Sentry, Amplitude, etc.). If you just want a URL to the session, you can save url. If you want a URL that sets the player to the time of when the error is called, you can save urlWithTimestamp.</p>
    <aside className="parameter">
      <h5>Returns <code>Promise&lt;{url: string, urlWithTimestamp: string}&gt;</code></h5>
      <article className="innerParameterContainer">
        <aside className="parameter">
          <h5>url <code>string</code></h5>
          <p>A URL for the session in Highlight.</p>
        </aside>
        <aside className="parameter">
          <h5>urlWithTimestamp <code>string</code></h5>
          <p>A URL for the session in Highlight, including the timestamp.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.getSessionDetails().then(({url, urlWithTimestamp}) => {
          console.log(url, urlWithTimestamp);
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.getSessionURL</h3>
    <p>This method is used to get the Highlight session URL for the current recording session. This is useful to use if you'd like to send the session URL to another application. See H.getSessionDetails() if you want to get the URL with the current time.</p>
    <aside className="parameter">
      <h5>Returns<code>string<string></code></h5>
    </aside>
  </div>
  <div className="right">
    <code>
      const highlightSessionUrl = await H.getSessionURL();

      thirdPartyApi.setMetadata({
          highlightSessionUrl
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.start</h3>
    <p>This method is used to start Highlight if H.init() was called with manualStart set to true.</p>
    <h6>Method Parameters</h6>
    <aside className="parameter">
      <h5>options<code>StartOptions</code> <code>optional</code></h5>
      <p>Optional configuration parameters.</p>
      <article className="innerParameterContainer">
        <aside className="innerParameterHeading">options properties</aside>
        <aside className="parameter">
          <h5>forceNew <code>boolean</code> <code>optional</code></h5>
          <p>Setting this option will start a new recording session.</p>
        </aside>
        <aside className="parameter">
          <h5>silent <code>boolean</code> <code>optional</code></h5>
          <p>Specifies whether console.warn messages created in this method should be skipped.</p>
        </aside>
      </article>
    </aside>
  </div>
  <div className="right">
    <code>
      H.init("<YOUR_PROJECT_ID>", {
          manualStart: true
      });

      // Elsewhere in your app
      H.start({
          silent: false
      });
    </code>
  </div>
</section>

<section className="section">
  <div className="left">
    <h3>H.stop</h3>
    <p>This method is used to stop Highlight from recording. Recording can be resumed later by calling H.start().</p>
  </div>
  <div className="right">
    <code>
      H.init("<YOUR_PROJECT_ID>");

      // Elsewhere in your app
      H.stop();
    </code>
  </div>
</section>
