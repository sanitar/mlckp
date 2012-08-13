class AddCustomParamsToBlocks < ActiveRecord::Migration
  def change
    add_column :blocks, :custom_params, :text
  end
end
