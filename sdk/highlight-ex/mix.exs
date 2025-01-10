defmodule Highlight.MixProject do
  use Mix.Project

  def project do
    [
      app: :highlight,
      version: "0.1.0",
      description: "Highlight Elixir SDK for capturing logs, spans and metrics",
      elixir: "~> 1.13",
      package: package(),
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      releases: [
        otel_getting_started: [
          version: "0.0.1",
          applications: [opentelemetry: :temporary, otel_getting_started: :permanent]
        ]
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
      {:ex_doc, ">= 0.0.0", only: :dev, runtime: false},
      {:opentelemetry, "~> 1.3"},
      {:opentelemetry_api, "~> 1.2"},
      {:telemetry, "~> 1.0"},
    ]
  end
end
