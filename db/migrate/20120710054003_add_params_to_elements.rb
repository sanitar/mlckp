class AddParamsToElements < ActiveRecord::Migration
  def change
    add_column :elements, :params, :text
  end
end
