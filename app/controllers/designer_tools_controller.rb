class DesignerToolsController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
    @project = Project.find(params[:project_id])
    @page = Page.find(params[:page_id])
    @pages = Page.where(:project_id => params[:project_id])
    @blocks = Block.where(:page_id => params[:page_id])
    render 'index', :layout => true
  end
end
