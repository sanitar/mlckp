class RemoveTypeFromBlocksInGroup < ActiveRecord::Migration
  def up
    remove_column :blocks_in_groups, :type
    add_column :blocks_in_groups, :inner_type, :string
  end

  def down
  end
end
