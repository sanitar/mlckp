class RemoveParentIdFromBlocks < ActiveRecord::Migration
  def up
    remove_column :blocks, :parent_id
    remove_column :blocks, :positionx
    remove_column :blocks, :positiony
    remove_column :blocks, :width
    remove_column :blocks, :height
    add_column :blocks, :params, :text
  end

  def down
  end
end
