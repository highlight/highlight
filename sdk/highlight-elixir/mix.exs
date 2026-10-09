defmodule Highlight.MixProject do
  use Mix.Project

  def project do
    [
      app: :highlight,
      version: "0.1.0",
      elixir: "~> 1.15",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  def application do
    [
      extra_applications: [:logger]
    ]
  end

  defp deps do
    [
      {:opentelemetry_api, "~> 1.2.2"},
      {:opentelemetry, "~> 1.3.1"},
      {:opentelemetry_exporter, "~> 1.6.0"},
      {:telemetry, "~> 1.0"}
    ]
  end
end
