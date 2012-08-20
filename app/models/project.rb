class Project < ActiveRecord::Base
  attr_accessible :name, :description, :width, :height, :settings
  before_save :default_values
  def default_values
    self.width ||= 800
    self.height ||= 1000
    self.settings ||= '{"snapToGrid":true,"snapToObject":true,"showRuler":true,"showGrid":true,"gridWidth":5,"gridHeight":5}'
  end
end
