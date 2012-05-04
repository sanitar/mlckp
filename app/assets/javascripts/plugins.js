Mock.namespace('Mock.plugins');

Mock.plugins.Plugin = Mock.extend(Backbone.Events, {
   initialize: function(obj) {
       $.extend(this, obj);
       if (this.parent.view){
           this.el = this.parent.view.$el;
       }
   },
   enable: function(){
       this.toggle(false);
   },
   disable: function(){
       this.toggle(true);
       console.log('disable');
   },
   toggle: function(){}
});


Mock.plugins.Draggable = Mock.extend(Mock.plugins.Plugin, {
   initialize: function() {
       console.log('initialize plugin draggable', this);
       this.el.draggable({
           containment: Mock.C.workspace_id
       });
   },
   toggle: function(enable){
       console.log('toggle in drag');
       this.el.draggable("option", "disabled", enable);
   }
});
