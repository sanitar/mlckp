class AddIsGroupToBlocks < ActiveRecord::Migration
  def change
    add_column :blocks, :is_group, :boolean, :default => false, :null => false
  end
end
