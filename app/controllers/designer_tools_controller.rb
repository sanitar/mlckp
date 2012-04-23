class DesignerToolsController < ApplicationController
  def index
    @blocks = Block.where(:page_id => params[:page_id])
    @groups = ElementGroup.all
    @elements = Element.all
    @page = Page.find(params[:page_id])
    @project = Project.find(params[:project_id])
    render 'index', :layout => true
  end
end
