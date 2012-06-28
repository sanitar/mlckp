class AddNameToElement < ActiveRecord::Migration
  def change
    add_column :elements, :name, :string
    add_column :elements, :description, :text
    remove_column :elements, :label
    remove_column :elements, :tag
  end
end
