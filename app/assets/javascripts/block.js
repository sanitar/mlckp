Mock = {};

// класс модели
Mock.BlockModel = Backbone.Model.extend({});

// класс коллекций модели
Mock.BlocksCollection = Backbone.Collection.extend({
    url: 'blocks',
    model: Mock.BlockModel
});

// вьюха для блока
Mock.BlockView = Backbone.View.extend({
    initialize: function(options){
        this.el_model = options.el_model;
        this.template = options.template;
        this.render();
    },

    render: function(){
        var self = this;
        this.el = $(this.template(this.el_model.toJSON()));
        this.$el = $(this.el);
        this.$el.attr('id', 'block-' + this.cid);

        this.$el.addClass(this.el_model.attributes.css);

        this.$el.css({
           left: this.model.get('positionx'),
           top: this.model.get('positiony'),
           position: 'absolute'
        });

        if (this.model.get('width') !== undefined){
            this.$el.width(this.model.get('width'));
        }
        if (this.model.get('height') !== undefined){
            this.$el.height(this.model.get('height'));
        }

        $('#workspace').append(this.$el);

        $(this.$el).draggable({
            containment: '#workspace'
        }).resizable({
            containment: '#workspace'
        });
        $(this.$el).hover(this.onHoverIn, this.onHoverOut);

        return this;
    },

    onHoverIn: function(e){
        $(this).find('.ui-icon-gripsmall-diagonal-se').show();
        $(this).find('.btn-controls').show();

    },

    onHoverOut: function(e){
        $(this).find('.ui-icon-gripsmall-diagonal-se').hide();
        if (!$(this).hasClass('selected')){
            $(this).find('.btn-controls').hide();
        }
    }
});

// контроллер для блока
Mock.BlockController = Backbone.View.extend({
    events: {
        'dragstop' : 'savePosition',
        'resizestop': 'savePosition',
        'click .btn-delete': 'onDelete'
    },

    initialize: function(cfg){
        $.extend(true, this, cfg);
        this.$el = this.view.$el;
        this.el = this.view.el;

        if (this.model.isNew()){
            this.savePosition();
        }

    },

    savePosition: function(){
        var pos = this.view.$el.position();

        this.model.set({
            'positionx': pos.left,
            'positiony': pos.top,
            'width': this.view.$el.width(),
            'height': this.view.$el.height()
        });
        this.model.save([]);
    },

    onDelete: function(){
        var self = this;
        this.model.destroy({
            success: function(){
                self.view.remove();
                self.view.$el.unbind();
                self.remove();
                self.$el.unbind();
            }
        });
    }
});

Mock.DragObjects = function(){
    var dragCfg = {
        offset: {},
        objs: []
    };
    return {
        cls: 'ui-selected',

        init: function(){
            var self = this;
            $('#workspace').selectable({
                filter: '.block'
            });
            $('.block').live({
                'click': function(e){
                    $(this).toggleClass(self.cls);
                },

                'dragstart': function(e){
                    if ($(this).hasClass('ui-selected')){
                        dragCfg.objs = $('.ui-selected', '#workspace');
                        dragCfg.objs.each(function(item){
                            var el = $(this);
                            el.data("offset", el.offset());
                        });
                        dragCfg.objs = dragCfg.objs.not(this);
                        dragCfg.offset = $(this).offset();
                    }  else {
                        dragCfg.objs = [];
                    }
                },

                'drag': function(e, ui){
                    if (dragCfg.objs.length > 0){
                        self.onMultipleDrag.apply(self, [e, this, ui]);
                    }
                },
                'dragstop': function(e, ui){
                    $(self).trigger('dragstop', [dragCfg.objs]);
                }
            });
        },

        onMultipleDrag: function(e, el, ui){
            var dt = ui.position.top - dragCfg.offset.top,
                dl = ui.position.left - dragCfg.offset.left,
                w = $('#workspace').width(), h = $('#workspace').height();

            $(dragCfg.objs).each(function(){
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
    }
}
