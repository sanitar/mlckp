class CreateBlocksInGroups < ActiveRecord::Migration
  def change
    create_table :blocks_in_groups do |t|
      t.references :group
      t.integer :inner
      t.string :type

      t.timestamps
    end
  end
end
