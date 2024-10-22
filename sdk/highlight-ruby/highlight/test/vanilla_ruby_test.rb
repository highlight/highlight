require_relative 'test_helper'
require 'highlight'

# This test is used to test the Highlight Ruby SDK without any external
# dependencies.
class VanillaRubyTest < Minitest::Test
  def setup
    @calculator = Calculator.new
  end

  def teardown
    Highlight.flush
  end

  def test_add
    result = @calculator.add(2, 3)
    assert_equal(5, result)
  end

  def test_multiply
    result = @calculator.multiply(4, 5)
    assert_equal(20, result)
  end
end

class Calculator
  def add(a, b)
    Highlight.start_span('add_operation') do |span|
      span.set_attribute('a', a)
      span.set_attribute('b', b)
      result = a + b
      span.set_attribute('result', result)

      Highlight.log('info', 'add_operation', a: a, b: b, result: result)

      result
    end
  end

  def multiply(a, b)
    Highlight.start_span('multiply_operation') do |span|
      span.set_attribute('a', a)
      span.set_attribute('b', b)
      result = a * b
      span.set_attribute('result', result)

      Highlight.log('info', 'multiply_operation', a: a, b: b, result: result)

      result
    end
  end
end
