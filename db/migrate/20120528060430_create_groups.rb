class CreateGroups < ActiveRecord::Migration
  def change
    create_table :groups do |t|
      t.text :params
      t.references :page

      t.timestamps
    end
    add_index :groups, :page_id
  end
end
