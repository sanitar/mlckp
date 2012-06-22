class AddBlocksToGroups < ActiveRecord::Migration
  def change
    add_column :groups, :blocks, :string
    add_column :groups, :groups, :string
    add_column :groups, :z, :integer
  end
end
