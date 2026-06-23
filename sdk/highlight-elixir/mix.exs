defmodule Highlight.MixProject do
  use Mix.Project

  @version "0.1.0"
  @source_url "https://github.com/highlight/highlight"

  def project do
    [
      app: :highlight,
      version: @version,
      elixir: "~> 1.14",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      elixirc_paths: elixirc_paths(Mix.env()),
      name: "Highlight",
      description: "Elixir SDK for Highlight.io error monitoring and logging",
      source_url: @source_url,
      docs: docs(),
      package: package(),
      aliases: aliases()
    ]
  end

  def application do
    [
      extra_applications: [:logger],
      mod: {Highlight.Application, []}
    ]
  end

  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  defp deps do
    [
      {:opentelemetry_api, "~> 1.3"},
      {:opentelemetry, "~> 1.4"},
      {:opentelemetry_exporter_otlp, "~> 1.6"},
      {:opentelemetry_semantic_conventions, "~> 1.25"},
      {:jason, "~> 1.4"},
      {:telemetry, "~> 1.2"},
      {:ex_doc, "~> 0.31", only: :dev, runtime: false}
    ]
  end

  defp docs do
    [
      main: "readme",
      extras: ["README.md", "CHANGELOG.md"],
      source_ref: "v#{@version}"
    ]
  end

  defp package do
    [
      maintainers: ["Highlight"],
      licenses: ["Apache-2.0"],
      links: %{"GitHub" => @source_url}
    ]
  end

  defp aliases do
    [
      setup: ["deps.get", "compile"],
      test: ["test --trace"]
    ]
  end
end
