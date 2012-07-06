class PagesController < ApplicationController
  def index
    @groups = ElementGroup.all
    @elements = Element.all
    @project = Project.find(params[:project_id])
    @pages = Page.where(:project_id => params[:project_id])
    @css = ''
    @elements.each do |element|
      s = element.css
      while s.size > 0 do
        extra = s[/(\/\*(.)*?\*\/|\s|\t)*/m]
        if extra != nil
          @css += extra
          s = s[extra.size, s.size]
        end
        if s.index(/{.*?}/m) != nil
          ind = s.index('}')
          @css += '.mock-' + element.id.to_s + ' ' + s[0, ind + 1]
          s = s[ind + 1, s.size]
        else
          @css += s
          s = ""
        end
      end
      @css += "\n"
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
