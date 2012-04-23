class MockController < ApplicationController
  def blocks
    data = Block.where(:page_id => params[:page_id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => data.to_json
  end
end