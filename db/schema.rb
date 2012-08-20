# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20120815164313) do

  create_table "blocks", :force => true do |t|
    t.integer  "element_id"
    t.integer  "page_id"
    t.datetime "created_at",                       :null => false
    t.datetime "updated_at",                       :null => false
    t.text     "params"
    t.integer  "z_index"
    t.integer  "parent_id"
    t.boolean  "is_group",      :default => false, :null => false
    t.text     "custom_params"
    t.text     "data"
  end

  create_table "element_groups", :force => true do |t|
    t.string   "label"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "elements", :force => true do |t|
    t.integer  "element_group_id"
    t.text     "html"
    t.text     "css"
    t.text     "js"
    t.datetime "created_at",       :null => false
    t.datetime "updated_at",       :null => false
    t.string   "name"
    t.text     "description"
    t.text     "initial"
    t.text     "params"
    t.text     "dependencies"
    t.text     "data"
  end

  create_table "pages", :force => true do |t|
    t.string   "name"
    t.text     "description"
    t.integer  "project_id"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  add_index "pages", ["project_id"], :name => "index_pages_on_project_id"

  create_table "projects", :force => true do |t|
    t.string   "name"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
    t.text     "description"
    t.integer  "width"
    t.integer  "height"
    t.string   "settings"
  end

end
