class CreatePages < ActiveRecord::Migration
  def change
    create_table :pages do |t|
      t.string :name
      t.text :description
      t.references :project

      t.timestamps
    end
    add_index :pages, :project_id
  end
end
