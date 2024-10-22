# frozen_string_literal: true

class PagesController < ApplicationController
  def home
    Highlight.start_span('pages-home-fetch') do
      uri = URI.parse('http://www.example.com/?test=1')
      response = Net::HTTP.get_response(uri)
      @data = response.body
    end
  end
end
