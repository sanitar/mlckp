class ElementsController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all.to_json
 end

  def create
    data = params[:data]
    res = {}
    data.each do |obj|
      element = Element.new(obj[1])
      if element.save
        res[obj[0]] = element
      else
        res[obj[0]] = "error"
      end
    end
    render :text => res.to_json
  end

  def update
    data = params[:data]
    res = []
    data.each do |obj|
      element = Element.find(obj[0])
      if (not element.update_attributes(obj[1]))
        res.push({obj[0] => 'error'})
      end
    end
    render :text => res.to_json

  end

  def destroy
    data = params[:data]
    data.each do |obj|
      element = Element.find(obj)
      element.destroy
    end
    render :text => [].to_json
  end

  def result
    if params[:id]
      @element = Element.find(params[:id])
      @element[:css] = add_class_to_css(@element)
    end
    render 'result', :layout => false
  end
end
