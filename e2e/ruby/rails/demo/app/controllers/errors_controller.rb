# frozen_string_literal: true

class ErrorsController < ApplicationController
  def create
    begin
      1/0
    rescue => e
      Highlight.exception(e, { foo: 'bar' })
    end
  end
end
