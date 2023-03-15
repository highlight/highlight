require_relative '../highlight'

module HighlightRails
    def with_highlight_context
        highlight_headers = H.parse_headers(request.headers)
        H.instance.trace(highlight_headers.secureSessionId, highlight_headers.request_id) { yield }
    end
end
