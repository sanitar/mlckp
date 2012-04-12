require 'test_helper'

class ReviewerToolsControllerTest < ActionController::TestCase
  test "should get reviewer_tools" do
    get :reviewer_tools
    assert_response :success
  end

end
