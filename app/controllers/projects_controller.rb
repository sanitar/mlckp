class ProjectsController < ApplicationController
  def new
    @project = Project.new
    render 'new', :layout => true
  end
  
  def create
    @project = Project.new(params[:project])
    if @project.save
      redirect_to "/"
    else
      render :action => 'new'
    end
  end
  
  def edit
    @project = Project.find(params[:id])
  end

  def update
    @project = Project.find(params[:id])
    if @project.update_attributes(params[:project])
      redirect_to "/"
    else
      render :action => 'edit'
    end
  end
  
  def destroy
    @project = Project.find(params[:id])
    @project.destroy
    redirect_to "/"
  end  
end
