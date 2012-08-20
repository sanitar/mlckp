class ProjectsController < ApplicationController
  def index
    @projects = Project.all
  end

  def new
    @project = Project.new
    render 'new', :layout => true
  end

  def create
    @project = Project.new(params[:project])
    if @project.save
      redirect_to projects_path
    else
      render :action => 'new'
    end
  end

  def edit
    @project = Project.find(params[:id])
  end

  def updateParams
    @project = Project.find(params[:id])
    if @project.update_attributes(params[:project])
      render :text => [].to_json
    end
  end

  def update
    @project = Project.find(params[:id])
    if @project.update_attributes(params[:project])
      redirect_to projects_path
    else
      render :action => 'edit'
    end
  end

  def destroy
    @project = Project.find(params[:id])
    @project.destroy
    redirect_to projects_path
  end
end
