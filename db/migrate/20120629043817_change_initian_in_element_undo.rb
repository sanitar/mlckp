class ChangeInitianInElementUndo < ActiveRecord::Migration
  def up
    remove_column :elements, :initial
    add_column :elements, :initial, :text
  end

  def down
  end
end
