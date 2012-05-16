class ElementsController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
 end

  def new
    @element = Element.new
    @group_id = params[:group_id]
    render 'new', :layout => true
  end

  def create
    data = params[:element]
    @element = Element.new(data)
    if @element.save
      data = @element
    else
      data = []
    end
    render :text => data.to_json
  end

  def edit
    @element = Element.find(params[:id])
    @group_id = params[:group_id]
  end

  def update
    @element = Element.find(params[:id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    if @element.update_attributes(params[:element])
      data = @element
    else
      data = []
    end
    render :text => data.to_json
  end

  def destroy
    @element = Element.find(params[:id])
    @element.destroy
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => [].to_json
  end
end
