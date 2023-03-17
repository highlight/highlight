require 'highlight'

class ApplicationController < ActionController::Base
    include Highlight::Integrations::Rails

    around_action :highlight_wrapper

    private

    def highlight_wrapper
        Highlight::Integrations::Rails::with_highlight_context(request) { yield }
    end
end
