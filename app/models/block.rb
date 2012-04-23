class Block < ActiveRecord::Base
  belongs_to :page
  belongs_to :element
  attr_accessible :element_id, :height, :page_id, :parent_id, :positionx, :positiony, :width
end
