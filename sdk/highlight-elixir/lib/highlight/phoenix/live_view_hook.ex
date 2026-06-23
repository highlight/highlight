defmodule Highlight.Phoenix.LiveViewHook do
  @moduledoc """
  Phoenix LiveView hook for Highlight error monitoring.

  Attach this hook to your LiveView to automatically capture exceptions.

  ## Usage

      defmodule MyAppWeb.PageLive do
        use MyAppWeb, :live_view
        use Highlight.Phoenix.LiveViewHook

        ...
      end
  """

  defmacro __using__(_opts) do
    quote do
      import Highlight.Phoenix.LiveViewHook

      @before_compile Highlight.Phoenix.LiveViewHook

      def handle_event(event, params, socket) do
        try do
          super(event, params, socket)
        rescue
          e ->
            Highlight.record_exception(e, attributes: %{
              "live_view.event" => event,
              "live_view.id" => socket.id
            })
            reraise e, __STACKTRACE__
        end
      end
    end
  end

  defmacro __before_compile__(_env) do
    quote do
      def handle_params(params, uri, socket) do
        try do
          super(params, uri, socket)
        rescue
          e ->
            Highlight.record_exception(e, attributes: %{
              "live_view.uri" => uri,
              "live_view.id" => socket.id
            })
            reraise e, __STACKTRACE__
        end
      end
    end
  end
end
