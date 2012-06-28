class ChangeInitialInElement < ActiveRecord::Migration
  def up
    remove_column :elements, :initial
    add_column :elements, :initial, :text, :null => false, :default => '{"w":200,"h":200,"e":true,"r":{"x":true,"y":true}}'
  end

  def down
  end
end
