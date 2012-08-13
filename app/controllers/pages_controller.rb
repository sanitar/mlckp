class PagesController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
    @project = Project.find(params[:project_id])
    @pages = Page.where(:project_id => params[:project_id])
    @css = ''
    @links = {'js' => [], 'css' => []}
    @elements.each do |element|
      @css += add_class_to_css(element)
      @link = get_links(element.dependencies)
      @links['js'] += @link['js']
      @links['css'] += @link['css']
    end
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
end
