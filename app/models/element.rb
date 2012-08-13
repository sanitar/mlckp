class Element < ActiveRecord::Base
  belongs_to :element_group
  attr_accessible :css, :element_group, :html, :js, :name, :description, :element_group_id, :initial, :params, :dependencies, :data
  before_save :default_values
  def default_values
    self.css ||= ''
    self.initial ||= '{"w":200,"h":200,"r":{"x":true,"y":true}}'
  end
end
