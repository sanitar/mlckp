class DropMock < ActiveRecord::Migration
  def up
    drop_table :mocks
  end

  def down
  end
end
