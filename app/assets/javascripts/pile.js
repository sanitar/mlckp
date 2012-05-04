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

Mock.Selections = Mock.extend(Mock.Collection, {
   click: false,
   initialize: function(o){
        $.extend(this, o);
        var self = this;

        $(this).bind('additem', this.onAddSelection);
        $(this).bind('removeitem', this.onRemoveSelection);

        $('#workspace').selectable({
            filter: '.block',
            stop: this.onStopSelect.createDelegate(this),
            start: this.onStartSelect.createDelegate(this)
        });

        $('.block').live({
            'dblclick': function(e){
                self.onDblClick(e, this);
            },
            'click': function(e){
                self.onClick(e, this);
                return false;
            },
            'dragstart': function(){
                self.onDragStart(this);
            }
        });
    },

    onAddSelection: function(e, el, collection){
        console.log('add: ', el,  collection);
        $(el).addClass('ui-selected');
    },

    onRemoveSelection: function(e, el, collection){
        console.log('remove: ', el, collection);
        $(el).removeClass('ui-selected');
    },

    onStartSelect: function(e, ui){
        this.removeAll();
    },

    onStopSelect: function(e, ui){
        var sels = $('.block.ui-selected').get();
        if (sels.length > 0){
            this.add(sels);
        }
    },

    onDblClick: function(e, el){
        if (!this.inArray(el)){
            this.add(el);
        }
    },

    onClick: function(e, el){
        if (this.click == true) return;
        var self = this;
        if (e.ctrlKey){
            this.toggle(el);
        } else {
            var here = this.inArray(el);
            if (this.isEmpty()){
                this.add(el);
            } else {
                if (this.collection.length == 1 && here) {
                    this.remove(el);
                } else {
                    if (this.collection.length > 0 && !here){
                        this.removeAll();
                        this.add(el);
                    } else {
                        if (this.collection.length > 1 && here){
                            this.remove($(this.collection).not(el).get());
                        }
                    }
                }
            }
        }
        // чтобы второй раз не вызывалась функция "onClick"
        this.click = true;
        setTimeout(function(){ self.click = false; }, 400);
    },

    onDragStart: function(el){
        if (!this.inArray(el)){
            this.removeAll();
            this.add(el);
        }
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