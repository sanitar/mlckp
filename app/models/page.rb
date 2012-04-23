class Page < ActiveRecord::Base
  belongs_to :project
  attr_accessible :description, :name, :project_id
end
