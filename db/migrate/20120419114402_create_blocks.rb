class CreateBlocks < ActiveRecord::Migration
  def change
    create_table :blocks do |t|
      t.references :element
      t.references :page
      t.integer :positionx
      t.integer :positiony
      t.integer :width
      t.integer :height
      t.integer :parent_id

      t.timestamps
    end
  end
end
