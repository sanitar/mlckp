module ApplicationHelper
  def home_active
    'active' if params[:controller] == 'home'
  end
  def projects_active
    'active' if params[:controller] == 'projects'
  end
  def elements_active
    'active' if params[:controller] == 'elements'
  end
end
