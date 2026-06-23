defmodule Highlight.ConfigStore do
  @moduledoc false

  use Agent

  @doc false
  def start_link(_opts) do
    Agent.start_link(fn -> nil end, name: __MODULE__)
  end

  @doc """
  Stores the Highlight configuration.
  """
  @spec put(Highlight.Config.t()) :: :ok
  def put(config) do
    Agent.update(__MODULE__, fn _old -> config end)
  end

  @doc """
  Retrieves the current Highlight configuration, or `nil` if not initialized.
  """
  @spec get() :: Highlight.Config.t() | nil
  def get do
    Agent.get(__MODULE__, fn config -> config end)
  end

  @doc """
  Returns true if the SDK has been initialized.
  """
  @spec initialized?() :: boolean()
  def initialized? do
    get() != nil
  end

  @doc """
  Clears the stored configuration.
  """
  @spec clear() :: :ok
  def clear do
    Agent.update(__MODULE, fn _old -> nil end)
  end
end
