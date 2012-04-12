require 'test_helper'

class DeveloperToolsControllerTest < ActionController::TestCase
  test "should get developer_tools" do
    get :developer_tools
    assert_response :success
  end

end
