class AddDependenciesToElement < ActiveRecord::Migration
  def change
    add_column :elements, :dependencies, :text
  end
end
