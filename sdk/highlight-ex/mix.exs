defmodule Highlight.MixProject do
  use Mix.Project

  def project do
    [
      app: :highlight,
      version: "0.2.0",
      description: "Highlight Elixir SDK — automatic error tracking, Logger backend, and Phoenix/Plug HTTP tracing via OpenTelemetry",
      elixir: "~> 1.13",
      package: package(),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      test_coverage: [tool: ExCoveralls],
      preferred_cli_env: [
        coveralls: :test,
        "coveralls.html": :test
      ],
      docs: [
        main: "Highlight",
        extras: ["README.md"]
      ]
    ]
  end

  def package do
    [
      files: ["config", "lib", "mix.exs", "README.md"],
      maintainers: ["Vadim Korolik <vadim@highlight.io>"],
      licenses: ["Apache-2.0"],
      links: %{"GitHub" => "https://github.com/highlight/highlight"}
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      # OpenTelemetry core
      {:opentelemetry, "~> 1.3"},
      {:opentelemetry_api, "~> 1.3"},
      {:opentelemetry_semantic_conventions, "~> 0.2"},

      # OTLP HTTP exporter – ships traces/logs to otel.highlight.io:4318
      {:opentelemetry_exporter, "~> 1.6"},

      # Plug integration (optional – only needed for Highlight.Plug)
      {:plug, "~> 1.14", optional: true},

      # telemetry is a transitive dep but we pin it explicitly
      {:telemetry, "~> 1.0"},

      # Dev / test only
      {:ex_doc, ">= 0.0.0", only: :dev, runtime: false},
      {:plug_cowboy, "~> 2.6", only: :test, runtime: false}
    ]
  end
end
