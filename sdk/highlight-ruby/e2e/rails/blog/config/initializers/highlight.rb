require "highlight"

Highlight::H.new("1jdkoe52", "http://localhost:4318")
Rails.logger = Highlight::Logger.new(STDOUT)
