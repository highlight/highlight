require "test_helper"

class TraceTest < ActiveSupport::TestCase
  test "create" do
    trace = Trace.create(trace_id: '123', name: 'test-trace', kind: 'internal', status: 'success', duration: 100)
    assert_equal '123', trace.trace_id
    assert_equal 'test-trace', trace.name
    assert_equal 'internal', trace.kind
    assert_equal 'success', trace.status
    assert_equal 100, trace.duration
  end
end
