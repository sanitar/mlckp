class PagesController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
    @project = Project.find(params[:project_id])
    @pages = Page.where(:project_id => params[:project_id])
  end

  def create
    data = params[:page]
    data['project_id'] = params[:project_id]
    @pages = Page.new(data)
    if @pages.save
      data = @pages
    else
      data = []
    end
    render :text => data.to_json
  end


  def update
    @pages = Page.find(params[:id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    if @pages.update_attributes(params[:page])
      data = @pages
    else
      data = []
    end
    render :text => data.to_json
  end

  def destroy
    @page = Page.find(params[:id])
    @page.destroy
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => [].to_json
  end

  def save
    data = params[:data]
    render :text => params.to_json
  end

  def get_mocks
    data = Block.where(:page_id => params[:page_id])
    response.headers['Content-type'] = "text/plain; charset=utf-8"
    render :text => data.to_json
  end

  def update_mocks
    data = params[:data]
    logger.debug(params)
    data.each do |id, data|
      logger.debug(id, data)
    end
    render :text => data.to_json
  end

  def create_mocks
    render :text => "create"
  end

  def destroy_mocks
    render :text => "destroy"
  end
end
