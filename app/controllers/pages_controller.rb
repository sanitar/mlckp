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
    res = []
    data.each do |obj|
      block = Block.find(obj[0])
      if (not block.update_attributes(obj[1]))
        res.push({obj[0] => 'error'})
      end
    end
    render :text => res.to_json
  end

  def create_mocks
    data = params[:data]
    res = {}
    data.each do |obj|
      obj[1][:page_id] = params[:page_id]
      block = Block.new(obj[1])
      if block.save
        res[obj[0]] = block
      else
        res[obj[0]] = "error"
      end
    end
    render :text => res.to_json
  end

  def destroy_mocks
    data = params[:data]
    logger.debug('-------------delete------------')
    data.each do |obj|
      logger.debug(obj)
      block = Block.find(obj)
      block.destroy
    end
    render :text => [].to_json
  end
end
