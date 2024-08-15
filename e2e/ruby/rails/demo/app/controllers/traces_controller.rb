# frozen_string_literal: true

class TracesController < ApplicationController
  def create
    Highlight.start_span('example-trace-outer') do
      sleep 0.1

      Highlight.start_span('example-trace-inner') do
        sleep 0.2
      end
    end
  end

  def custom_project_id
    Highlight.start_span('example-trace-2', {
                           Highlight::H::HIGHLIGHT_PROJECT_ATTRIBUTE => '56gl9g91'
                         })
  end
end
