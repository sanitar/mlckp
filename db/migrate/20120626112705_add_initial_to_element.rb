class AddInitialToElement < ActiveRecord::Migration
  def change
    add_column :elements, :initial, :text
  end
end
