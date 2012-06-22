class Block < ActiveRecord::Base
  belongs_to :page
  belongs_to :element
  attr_accessible :element_id, :page_id, :params, :z_index, :parent_id, :is_group
end