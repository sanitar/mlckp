class CreateElements < ActiveRecord::Migration
  def change
    create_table :elements do |t|
      t.string :label
      t.references :element_group
      t.string :tag
      t.text :html
      t.text :css
      t.text :js

      t.timestamps
    end
  end
end
