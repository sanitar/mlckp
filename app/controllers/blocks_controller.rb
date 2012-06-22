class BlocksController < ApplicationController
  def index
    data = Block.find(:all,
      :select => 'id, element_id, params, z_index, parent_id, is_group',
      :conditions => {:page_id => params[:page_id]},
      :order => 'z_index, parent_id')
    render :text => data.to_json
  end

  def create
    data = params[:data]
    res = {}
    data.each do |obj|
      obj[1][:page_id] = params[:page_id]
      block = Block.new(obj[1])
      if block.save
        res[obj[0]] = block
      else
        res[obj[0]] = "error"
      end
    end
    render :text => res.to_json
  end

  def update
    data = params[:data]
    res = []
    data.each do |obj|
      block = Block.find(obj[0])
      if (not block.update_attributes(obj[1]))
        res.push({obj[0] => 'error'})
      end
    end
    render :text => res.to_json
  end

  def destroy
    data = params[:data]
    data.each do |obj|
      block = Block.find(obj)
      block.destroy
    end
    render :text => [].to_json
  end

end
