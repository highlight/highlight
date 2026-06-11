# Highlight Elixir SDK

The official [highlight.io](https://highlight.io) SDK for Elixir and Phoenix. Automatically captures errors, logs, and HTTP request traces using OpenTelemetry and ships them to your Highlight project.

## Features

- **Error tracking** — `Highlight.record_exception/2` records any exception or thrown term as an OTel span, associating it with a Highlight session and request.
- **Logger backend** — `Highlight.Logger` is a drop-in `:gen_event` backend that forwards every `Logger.info/warn/error` call to Highlight as an OTel log record.
- **Phoenix / Plug middleware** — `Highlight.Plug` instruments every HTTP request with an OTel server span, extracting Highlight session/request headers automatically.
- **OTLP export** — ships everything over OTLP/HTTP to `https://otel.highlight.io:4318` (configurable).

---

## Installation

Add `highlight` and the OTLP exporter to your `mix.exs`:

```elixir
defp deps do
  [
    {:highlight, "~> 0.2"},
    {:opentelemetry_exporter, "~> 1.6"},
  ]
end
```

Run:

```sh
mix deps.get
```

---

## Quick Start

### 1. Initialize the SDK

Call `Highlight.init/1` once during application startup (typically in `MyApp.Application.start/2`):

```elixir
defmodule MyApp.Application do
  use Application

  @impl true
  def start(_type, _args) do
    Highlight.init(%Highlight.Config{
      project_id: System.get_env("HIGHLIGHT_PROJECT_ID", "your_project_id"),
      service_name: "my_phoenix_app",
      service_version: "1.2.3"
      # otlp_endpoint: "https://otel.highlight.io:4318"  # this is the default
    })

    children = [
      MyAppWeb.Endpoint,
      # ... other workers
    ]

    Supervisor.start_link(children, strategy: :one_for_one, name: MyApp.Supervisor)
  end
end
```

### 2. Add the Plug middleware (Phoenix / Plug)

Add `Highlight.Plug` to your Phoenix endpoint **before** the router so every request gets a trace:

```elixir
defmodule MyAppWeb.Endpoint do
  use Phoenix.Endpoint, otp_app: :my_app

  # Add Highlight tracing early in the pipeline
  plug Highlight.Plug

  plug Plug.Session, ...
  plug MyAppWeb.Router
end
```

Or in a plain Plug router:

```elixir
defmodule MyApp.Router do
  use Plug.Router

  plug Highlight.Plug
  plug :match
  plug :dispatch

  get "/" do
    send_resp(conn, 200, "Hello!")
  end
end
```

`Highlight.Plug` will:
- Create a server-side OTel span for every request (`GET /users/:id` style naming)
- Attach `http.method`, `http.url`, `http.route`, `http.status_code`, `net.peer.ip` attributes (OTel HTTP semantic conventions)
- Extract `x-highlight-session-id` and `x-highlight-request-id` request headers injected by the browser SDK and attach them as `highlight.session_id` / `highlight.trace_id`
- Propagate W3C `traceparent` / `tracestate` so client and server traces are linked in Highlight

### 3. Add the Logger backend

Capture all your application logs in Highlight by adding `Highlight.Logger` to your logger config:

```elixir
# config/config.exs
config :logger,
  backends: [:console, Highlight.Logger]

config :logger, Highlight.Logger,
  level: :info,                                    # minimum level to forward
  metadata: [:request_id, :session_id, :user_id]  # extra metadata to include
```

Each log line becomes an OTel span event with the log level, message, and any configured metadata attached as attributes.

### 4. Record exceptions manually

```elixir
try do
  some_risky_operation()
rescue
  exception ->
    Highlight.record_exception(exception,
      session_id: conn.assigns[:highlight_session_id],
      request_id: conn.assigns[:highlight_request_id]
    )
    reraise exception, __STACKTRACE__
end
```

Or from inside a Plug/LiveView where you have the session/request IDs in assigns:

```elixir
rescue
  e ->
    Highlight.record_exception(e,
      session_id: get_session(conn, "highlight_session_id")
    )
```

---

## Configuration Reference

```elixir
%Highlight.Config{
  project_id: "abc123",          # required – your Highlight project ID
  service_name: "my-app",        # optional – shows in Highlight as the service name
  service_version: "1.0.0",      # optional
  otlp_endpoint: "https://otel.highlight.io:4318"  # default
}
```

---

## Development

```sh
# Install dependencies
mix deps.get

# Compile
mix compile

# Run tests
mix test
```

Start an interactive shell with the project loaded:

```sh
iex -S mix
```

---

## Prerequisites

- Elixir 1.13+
- Erlang/OTP 24+

```sh
elixir -v
# Erlang/OTP 25 [erts-13.x] [64-bit]
# Elixir 1.15.x (compiled with Erlang/OTP 25)
```
