# frozen_string_literal: true

class ErrorsController < ApplicationController
  def create
    1 / 0
  rescue StandardError => e
    Highlight.exception(e, { foo: 'bar' })
  end
end
