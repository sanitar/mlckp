class ApplicationController < ActionController::Base
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
end
