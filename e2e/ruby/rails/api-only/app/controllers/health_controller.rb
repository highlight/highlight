class HealthController < ApplicationController
  def index
    render(json: { status: 'ok', timestamp: Time.current })
  end

  def error
    raise(StandardError, 'Test API error')
  end
end
