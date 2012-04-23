class BlocksController < ApplicationController
  def index
    data = Block.where(:page_id => params[:page_id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => data.to_json
  end

  def create
    data = params[:block]
    data["page_id"] = params[:page_id]
    @blocks = Block.new(data)
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    if @blocks.save
      data = @blocks
    else
      data = []
    end
    render :text => data.to_json
  end

  def update
    @blocks = Block.find(params[:id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    if @blocks.update_attributes(params[:block])
      data = @blocks
    else
      data = []
    end
    render :text => data.to_json
  end

  def destroy
    @block = Block.find(params[:id])
    @block.destroy
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => [].to_json
  end
end
