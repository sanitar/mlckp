class AddZIndexToBlocks < ActiveRecord::Migration
  def change
    add_column :blocks, :z_index, :integer
  end
end
