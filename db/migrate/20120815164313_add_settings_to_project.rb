class AddSettingsToProject < ActiveRecord::Migration
  def change
    add_column :projects, :width, :integer
    add_column :projects, :height, :integer
    add_column :projects, :settings, :string
  end
end
