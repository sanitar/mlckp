class GroupsController < ApplicationController
  def index
    data = Group.find(:all,
      :order => 'z',
      :conditions => {:page_id => params[:page_id]},
      :select => 'blocks, groups, id, page_id, params, z')
    render :text => data.to_json
  end

  def create
    data = params[:data]
    res = {}
    data.each do |obj|
      obj[1][:page_id] = params[:page_id]
      group = Group.new(obj[1])
      if group.save
         res[obj[0]] = group
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
      group = Group.find(obj[0])
      if (not group.update_attributes(obj[1]))
        res.push({obj[0] => 'error'})
      end
    end
    render :text => res.to_json
  end

  def destroy
    data = params[:data]
    data.each do |obj|
      group = Group.find(obj)
      group.destroy
    end
    render :text => [].to_json
  end

  def destroy_with_content
    logger.debug('------- destroy_with_content -----------')
    render :text => [].to_json
  end
end
