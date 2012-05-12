Mock.namespace('Mock');

Mock.CompositeSelections = Mock.extend(Mock.Observable, {
   initialize: function(){
       this.children = [];
   },
   add: function(child){
       this.children.push(child);
   },
   remove: function(child){
       this.children.remove(child);
   }
});


/*
Mock.MultipleSelection = function(attributes, options) {
    this.dragCfg = {
        offset: {},
        objs: []
    };
    this.selection = [];
    this.cls = 'ui-selected';
    this.initialize.apply(this, arguments);
};
_.extend(Mock.MultipleSelection.prototype, Backbone.Events, {
    initialize: function(){
        this.initEvents();
    },
    initEvents: function(){
        var self = this;
         $('#workspace').selectable({
            filter: '.block',
            stop: function(){
                self.onSelectableStop.apply(self, []);
            }
        });

        $('.block').live({
            'dblclick': function(e){
                $(this).addClass('ui-selected');
                self.trigger('add', this);
            },
            'click': function(e){
                var dragObjs = $('.ui-selected', '#workspace').not(this);
                if (!e.ctrlKey){
                    dragObjs.removeClass('ui-selected');
                    if (dragObjs.length > 0 && $(this).hasClass('ui-selected')){
                        return;
                    }
                }
                $(this).toggleClass('ui-selected');
            },

            'dragstart': function(e){
                if ($(this).hasClass('ui-selected')){
                    self.dragCfg.objs = $('.ui-selected', '#workspace');
                    self.dragCfg.objs.each(function(item){
                        var el = $(this);
                        el.data("offset", el.offset());
                    });
                    self.dragCfg = {
                        objs: self.dragCfg.objs.not(this),
                        offset: $(this).offset()
                    }
                }  else {
                    self.dragCfg.objs = [];
                    $('.ui-selected', '#workspace').not(this).removeClass('ui-selected');
                    $(this).addClass('ui-selected');
                }
            },

            'drag': function(e, ui){
                if (self.dragCfg.objs.length > 0){
                    self.onMultipleDrag.apply(self, [e, this, ui]);
                }
            },
            'dragstop': function(e, ui){
                $(self).trigger('dragstop', [self.dragCfg.objs]);
            }
        });
        this.bind('add', this.onAdd, this);
        this.bind('remove', this.onRemove, this);
    },
    onSelectableStop: function(){
        //this.selection = $('.ui-selected', '#workspace');
    },
    onAdd: function(arr){
        console.log('add', arr);
        //this.selection.push(arr);
    },
    onRemove: function(arr){
        console.log('remove', arr);
    },
    get: function(){
        return $('.ui-selected', '#workspace');
    },
    onMultipleDrag: function(e, el, ui){
        var dt = ui.position.top - this.dragCfg.offset.top,
            dl = ui.position.left - this.dragCfg.offset.left,
            w = $('#workspace').width(), h = $('#workspace').height();

        $(this.dragCfg.objs).each(function(){
           var el = $(this),
               off = el.data('offset'),
               left = off.left + dl,
               top = off.top + dt,
               x_max = w - el.width(),
               y_max = h - el.height();

           el.css({
              top: top < 0 ? 0 : (top > y_max ? y_max : top),
              left: left < 0 ? 0 : (left > x_max ? x_max : left)
           });
        });
    }
});
*/