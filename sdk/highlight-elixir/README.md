# highlight-elixir

Official Elixir SDK for [Highlight.io](https://highlight.io) error monitoring and logging.

[![Hex.pm](https://img.shields.io/hexpm/v/highlight.svg)](https://hex.pm/packages/highlight)
[![Docs](https://img.shields.io/badge/docs-hexpm-blue.svg)](https://hexdocs.pm/highlight)

## Installation

Add `highlight` to your list of dependencies in `mix.exs`:

```elixir
def deps do
  [
    {:highlight, "~> 0.1.0"}
  ]
end
```

## Configuration

Configure Highlight in your `config/config.exs`:

```elixir
config :highlight,
  project_id: "YOUR_PROJECT_ID"
```

Or set the environment variable:

```bash
export HIGHLIGHT_PROJECT_ID="YOUR_PROJECT_ID"
```

## Usage

### Initialize the SDK

Add Highlight initialization to your application startup:

```elixir
# lib/my_app/application.ex
defmodule MyApp.Application do
  use Application

  def start(_type, _args) do
    Highlight.init(
      project_id: "YOUR_PROJECT_ID",
      service_name: "my-app",
      environment: "production"
    )

    # ... your other children
  end
end
```

### Record Exceptions

Capture exceptions manually using `Highlight.record_exception/2`:

```elixir
try do
  risky_operation()
rescue
  e ->
    Highlight.record_exception(e,
      attributes: %{"user.id" => "123", "component" => "auth"}
    )
end
```

### Logging

Send log messages to Highlight:

```elixir
Highlight.log(:info, "User signed in")
Highlight.log(:error, "Database connection failed", %{"host" => "db.example.com"})
```

### Phoenix Integration

#### Plug

Add the Highlight plug to your pipeline in `router.ex`:

```elixir
pipeline :browser do
  plug Highlight.Phoenix.Plug
end
```

#### Error Handler

Handle errors in your `endpoint.ex` or error handler:

```elixir
# In your error handler module
def handle_errors(conn, %{kind: kind, reason: reason, stack: stack}) do
  Highlight.Phoenix.handle_error(conn, kind, reason, stack)
end
```

#### LiveView

Use the LiveView hook for automatic error capturing:

```elixir
defmodule MyAppWeb.PageLive do
  use MyAppWeb, :live_view
  use Highlight.Phoenix.LiveViewHook

  # Your live view code...
end
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `project_id` | `String.t()` | Required | Your Highlight project ID |
| `otlp_endpoint` | `String.t()` | `"https://otel.highlight.io:4318"` | OTLP endpoint URL |
| `service_name` | `String.t()` | `"elixir-app"` | Service name for tracing |
| `service_version` | `String.t()` | `""` | Service version |
| `environment` | `String.t()` | `""` | Deployment environment |
| `instrument_logging` | `boolean()` | `true` | Auto-instrument Logger |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `HIGHLIGHT_PROJECT_ID` | Your Highlight project ID |
| `HIGHLIGHT_ENVIRONMENT` | Deployment environment |

## Development

### Setup

```bash
mix deps.get
mix compile
```

### Run Tests

```bash
mix test
```

### Generate Documentation

```bash
mix docs
```

## License

Apache License 2.0
