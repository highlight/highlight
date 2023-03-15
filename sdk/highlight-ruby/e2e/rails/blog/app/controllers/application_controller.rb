require_relative '../../../../../highlight_io/sdk' 

class ApplicationController < ActionController::Base
    around_action H.HighlightRails.with_highlight_context
end
