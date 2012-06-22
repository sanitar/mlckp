class RemoveTables < ActiveRecord::Migration
  def up
    drop_table :groups
    drop_table :blocks_in_groups
  end

  def down
  end
end
