class Group < ActiveRecord::Base
  belongs_to :page
  attr_accessible :params, :page_id, :blocks, :groups, :z
end
