require_relative '../highlight_io/sdk'
require 'logger'

def test_zane
    H.new("qe9y4yg1")
    begin
        H.instance.trace(nil, nil) do
            raise RuntimeError.new('another zane test!')
        end
    rescue
    end
    H.instance.record_log(nil, nil, Logger::INFO, 'zane test log!')
    H.instance.record_log(nil, nil, Logger::ERROR, 'zane test error!')
    logger = H::LoggerWrapper.new(Logger.new(STDOUT))
    # logger = H::LoggerWrapper.new(Logger.new(STDOUT))
    logger.add(Logger::INFO, 'zane test log 2!')
    logger.info('zane test log 3!')
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
