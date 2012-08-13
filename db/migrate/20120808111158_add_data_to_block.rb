class AddDataToBlock < ActiveRecord::Migration
  def change
    add_column :blocks, :data, :text
  end
end
