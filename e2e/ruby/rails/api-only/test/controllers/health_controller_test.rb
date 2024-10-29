require 'test_helper'

# Tests for the Health controller
class HealthControllerTest < ActionDispatch::IntegrationTest
  test 'should get health check' do
    get health_path
    assert_response :success

    json = JSON.parse(response.body)
    assert_equal 'ok', json['status']
    assert json['timestamp'].present?
  end

  test 'should handle errors' do
    assert_raises StandardError do
      get error_path
    end
  end

  test 'should include highlight headers' do
    get health_path, headers: { 'X-Highlight-Request' => 'test-session/test-request' }
    assert_response :success
  end
end
