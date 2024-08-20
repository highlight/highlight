defmodule Highlight.MixProject do
  use Mix.Project

  def project do
    [
      app: :highlight,
      version: "0.1.0",
      elixir: "~> 1.12",
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

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:telemetry, "~> 1.0"},
      {:opentelemetry, "~> 1.3"},
      {:opentelemetry_api, "~> 1.2"}
    ]
  end
end
