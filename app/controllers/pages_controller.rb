class PagesController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
    @project = Project.find(params[:project_id])
    @pages = Page.where(:project_id => params[:project_id])
    render 'index', :layout => true
  end

  def new
    @pages = Page.new
    @project = Project.find(params[:project_id])
    render 'new', :layout => true
  end

  def create
    @pages = Page.new(params[:page])
    if @pages.save
      redirect_to project_pages_path
    else
      render :action => 'new'
    end
  end

  def edit
    @pages = Page.find(params[:id])
    @project = Project.find(params[:project_id])
  end

  def update
    @pages = Page.find(params[:id])
    if @pages.update_attributes(params[:page])
      redirect_to project_pages_path
    else
      render :action => 'edit'
    end
  end

  def destroy
    @pages = Page.find(params[:id])
    @pages.destroy
    redirect_to project_pages_path
  end
end
