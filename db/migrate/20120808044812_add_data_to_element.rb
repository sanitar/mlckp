class AddDataToElement < ActiveRecord::Migration
  def change
    add_column :elements, :data, :text
  end
end
