class CreateMocks < ActiveRecord::Migration
  def change
    create_table :mocks do |t|
      t.integer :element_id
      t.integer :page_id
      t.text :params

      t.timestamps
    end
  end
end
