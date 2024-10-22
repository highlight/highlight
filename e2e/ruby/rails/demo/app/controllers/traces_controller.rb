# frozen_string_literal: true

class TracesController < ApplicationController
  def create
    Highlight.start_span('example-trace-outer') do
      sleep(0.1)

      trace = Trace.new(name: 'trace', kind: 'internal')
      Highlight.start_span('example-trace-inner') do
        sleep(0.2)

        trace.save!
      end

      trace.update!(name: 'trace-updated')
    end
  end

  def custom_project_id
    Highlight.start_span('example-trace-2', { Highlight::H::HIGHLIGHT_PROJECT_ATTRIBUTE => '56gl9g91' })
  end
end
