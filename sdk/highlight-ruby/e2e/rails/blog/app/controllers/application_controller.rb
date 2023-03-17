require 'highlight'

class ApplicationController < ActionController::Base
    include Highlight::Integrations::Rails

    around_action :with_highlight_context
end
