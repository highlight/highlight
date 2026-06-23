defmodule Highlight.Application do
  @moduledoc false
  use Application

  @impl true
  def start(_type, _args) do
    children = [
      Highlight.ConfigStore
    ]

    opts = [strategy: :one_for_one, name: Highlight.Supervisor]
    Supervisor.start_link(children, opts)
  end
end
