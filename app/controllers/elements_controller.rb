class ElementsController < ApplicationController
  def index
    @elements = Element.all
 end

  def new
    @element = Element.new
    render 'new', :layout => true
  end

  def create
    @element = Element.new(params[:element])
    if @element.save
      redirect_to elements_path
    else
      render :action => 'new'
    end
  end

  def edit
    @element = Element.find(params[:id])
  end

  def update
    @element = Element.find(params[:id])
    if @element.update_attributes(params[:element])
      redirect_to elements_path
    else
      render :action => 'edit'
    end

  end

  def destroy
    @element = Element.find(params[:id])
    @element.destroy
    redirect_to elements_path
  end
end
