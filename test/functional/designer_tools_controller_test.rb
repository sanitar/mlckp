require 'test_helper'

class DesignerToolsControllerTest < ActionController::TestCase
  test "should get designer_tools" do
    get :designer_tools
    assert_response :success
  end

end
