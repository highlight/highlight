# frozen_string_literal: true

class LogsController < ApplicationController
  def create
    Highlight.log('info', 'hello, world!', { foo: 'bar' })
  end
end
