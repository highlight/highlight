# frozen_string_literal: true

class LogsController < ApplicationController
  def create
    Highlight.log('info', 'hello, world!', { foo: 'bar' })
  end

  def create_with_hash
    Rails.logger.info(test: 'ing', foo: 'bar')
  end
end
