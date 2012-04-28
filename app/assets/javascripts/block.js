var Mock = Mock || {};

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
        //this.el_model = options.el_model;
        this.template = options.template;
        //this.render();
    },

    render: function(el_model){
        var self = this;
        this.el_model = el_model;
        this.el = $(this.template(el_model.toJSON()));
        this.$el = $(this.el);
        this.$el.attr('id', 'block-' + this.cid);

        this.$el.addClass(el_model.attributes.css);

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
            containment: '#workspace',
            distance: 3,
            cancel: null,
            grid: [5, 5]
        }).resizable({
            containment: '#workspace',
            autoHide: true,
            grid: [5, 5]
        });
        $(this.$el).hover(this.onHoverIn, this.onHoverOut);

        return this;
    },

    transform: function(el_model){
        if (this.el_model == el_model) return;
        var new_el = $(el_model.get('html'));
        if (this.el_model){
            this.$el.removeClass(this.el_model.attributes.css);
            this.el_model = el_model;
            this.$el.css({
                width: '',
                height: ''
            });
        }
        var el = this.$el.find('.content > *').remove();
        this.$el.find('.content').wrapInner(new_el);
        this.$el.addClass(this.el_model.attributes.css);
    },

    onHoverIn: function(e){
        $(this).find('.btn-controls').show();

    },

    onHoverOut: function(e){
        if (!$(this).hasClass('selected')){
            $(this).find('.btn-controls').hide();
        }
    }
});
Mock.BlockControllerSoo1 = Mock.Controller.extend({
    initialize: function(cfg){
        //console.log('init Mock.BlockControllerSoo111: ', this.pluginsRoot);
        this.constructor.__super__.initialize.apply(this, [arguments]);
    }
});

Mock.BlockControllerSoo = Mock.Controller.extend({
    pluginsRoot: 'New wine',
    plugins: {
        someselect: 'soo special'
    },

    initialize: function(cfg){
        //console.log('init Mock.BlockControllerSoo', this.pluginsRoot);
        this.constructor.__super__.initialize.apply(this, [arguments]);

    }
});
// контроллер для блока
Mock.BlockController = Mock.Controller.extend({
    events: {
        'dragstop' : 'updatePosition',
        'resizestop': 'updatePosition',
        'click .btn-delete': 'onDelete'
    },

    plugins: {
        multiselect: 'MultiSelect'
    },

    initialize: function(cfg){
        //console.log('init Mock.BlockController: ', this.pluginsRoot);
        this.constructor.__super__.initialize.apply(this, [arguments]);
        $.extend(true, this, cfg);
        //console.log(this);

        //var some = new Mock.plugins.Multiselect(this);
        //console.log('plugin: ', some);

        this.view.render(this.getElementModelById(this.model.get('element_id')));

        this.$el = this.view.$el;
        this.el = this.view.el;

        if (this.model.isNew()){
            this.updatePosition();
        }
        this.model.bind('change:element_id', this.onChangeElement, this);
    },

    getElementModelById: function(el_id){
        return this.el_models.where({
            'id': el_id
        })[0];
    },

    updatePosition: function(){
        var pos = this.view.$el.position();

        this.model.set({
            'positionx': pos.left,
            'positiony': pos.top,
            'width': this.view.$el.width(),
            'height': this.view.$el.height()
        });
        this.model.save([]);
    },

    onChangeElement: function(model, el_id){
        this.view.transform(this.getElementModelById(el_id));
        this.updatePosition();
        //this.model.save([]);
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

Mock.Controllers = function(attributes, options) {
    this.initialize.apply(this, arguments);
};
_.extend(Mock.Controllers.prototype, Backbone.Events, {
    changes: [],
    controllers: [],
    plugins: {
        multiSelect : Mock.plugins.Multiselect
    },

    initialize: function(options){
        this.elements = options.elements;
        this.models = new Mock.BlocksCollection();
        this.elements = options.elements;
        this.selections = new Mock.MultipleSelection();
        this.fetch();
        var some = new Mock.BlockControllerSoo();
        var some1 = new Mock.BlockControllerSoo1();
        this.initEvents();
    },

    initEvents: function(){
        var self = this;
        this.models.bind('add', this.onModelAdd, this);
        $(this.selections).on('dragstop', function(e, objs){
            self.onDragStop.apply(self, [objs]);
        });
    },

    onModelAdd: function(model, collection){
        this.createController(model);
    },

    fetch: function(){
        var self = this;
        this.models.fetch({
            success: function(){
                self.onFetch();
            }
        });
    },

    onFetch: function(some){
        var self = this;
        this.models.each(function(item, index){
            self.createController(item);
        });
    },

    createController: function(model){
        var blockView = new Mock.BlockView({
            model: model,
            template: _.template($("#block-template").html())
        });

        var controller = new Mock.BlockController({
            model: model,
            view: blockView,
            el_models: this.elements
        });

        this.controllers.push(controller);
    },

    findModel: function(el){
        return this.findController(el).model;
    },

    findController: function(el){
        for (var i = 0, len = this.controllers.length; i < len; i++ ){
            if (this.controllers[i].el[0] == el){
                return this.controllers[i];
            }
        }
    },

    onDragStop: function(objs){
        var self = this;
        $(objs).each(function(index, el){
            self.findController(el).updatePosition();
        });
    }
});

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
