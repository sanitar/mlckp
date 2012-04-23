class CreateElementGroups < ActiveRecord::Migration
  def change
    create_table :element_groups do |t|
      t.string :label

      t.timestamps
    end
  end
end
