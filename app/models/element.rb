class Element < ActiveRecord::Base
  belongs_to :element_group
  attr_accessible :css, :element_group, :html, :js, :name, :description, :element_group_id, :initial
end
