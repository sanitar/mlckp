class ApplicationController < ActionController::Base
  http_basic_authenticate_with :name => "mlckp", :password => "palmanaogorode"
  protect_from_forgery
  def add_class_to_css(element)
    s = element.css
    @css = ''
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
    return @css
  end

  def get_links(str)
    res = { 'js' => [], 'css' => [] }
    if !str
      return res
    end
    urls = JSON.parse(str)
    urls.each do |url|
      if /(.)*\.js/.match url
        res['js'].push(url)
      end
      if /(.)*\.css/.match url
        res['css'].push(url)
      end
    end
    return res
  end
end
