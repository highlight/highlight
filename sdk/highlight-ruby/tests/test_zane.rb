# import pytest

# from e2e.highlight_aws.lambda_function import lambda_handler
# from highlight_io import H

require_relative '../highlight_io/sdk'
require 'logger'

# def test_aws
#     mocker.patch("random.random", return_value=0.1)
#     mock_trace = mocker.patch("highlight_io.H.trace")
#     # Construct a mock HTTP request.
#     req = {
#         H.REQUEST_HEADER: "a1b2c3/1234",
#     }

#     with pytest.raises(expected_exception=ValueError):
#         lambda_handler(req, None)

#     mock_trace.assert_called_with("a1b2c3", "1234")
# end

def test_zane
    H.new("1jdkoe52")
    begin
        H.instance.trace(nil, nil) { raise RuntimeError.new('another zane test!') }
    rescue
    end
    # H.instance.record_log(nil, nil, Logger::ERROR, 'zane test log!')
    puts 'flushing'
    H.instance.flush
    puts 'flushed'
    # book = Book.new(:title => "RSpec Intro", :price => 20)
    # customer = Customer.new
    # order = Order.new(customer, book)

    # order.submit

    # assert(customer.orders.last == order)
    # assert(customer.ordered_books.last == book)
    # assert(order.complete?)
    # assert(!order.shipped?)
end

test_zane
