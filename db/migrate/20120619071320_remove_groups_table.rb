class RemoveGroupsTable < ActiveRecord::Migration
  def up
    add_column :blocks, :parent_id, :integer
  end

  def down
    drop_table :groups
    drop_table :blocks_in_groups
  end
end
