Mock.namespace('Mock.block');

Mock.block.BlockModel = Backbone.Model.extend({});

Mock.block.BlocksCollection = Backbone.Collection.extend({
    url: 'blocks',
    model: Mock.block.BlockModel,
    initialize: function(){
        this.changes = {
            'delete': [],
            'update': {},
            'create': {}
        };
        //this.saving = false;
        this.bind('change', this.onChange);
        this.bind('remove', this.onRemove);
    },

    onRemove: function(model, col, obj){
        if (!model.isNew()){
            this.changes['delete'].push(model.id);
        }
    },

    onChange: function(model, ui){
        //console.log('change!!!', model, model.changedAttributes());
        var isNew = model.isNew(),
            id = isNew ? model.cid : model.id,
            arr = this.changes[isNew ? 'create' : 'update'];
        arr[id] = arr[id] || {};
        $.extend(arr[id], model.changedAttributes());
    },

    save: function(){
        console.log('we want save data: ', this.changes);
        var ch = this.changes,
            type = ch['delete'].length ? 'delete'
                : ($.isEmptyObject(ch['update']) ? 'create' : 'update');

        $.ajax({
            url: this.url + '/' + type,
            type: 'post',
            data: {
                'data': ch[type]
            },
            traditional: false,
            success: function(responce, result, info){
                console.log('ajax success!!', responce, result, info);
            }
        });

        this.changes[type] = type == 'delete' ? [] : {};
    }
});

Mock.block.BlockView = Backbone.View.extend({
    tpl_id: 'block-template',
    initialize: function(options){
        this.el_model = this.findModel(this.model.get('element_id'));
        this.render();
    },

    render: function(){
        var self = this,
            template = _.template($("#" + this.tpl_id).html());

        this.el = $(template(this.el_model.toJSON()))[0];
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

        $(this.$el)
        .resizable({
            containment: '#workspace',
            autoHide: true,
            grid: [5, 5]
        });
        $(this.$el).hover(this.onHoverIn, this.onHoverOut);

        return this;
    },

    onHoverIn: function(e){
        $(this).find('.btn-controls').show();

    },

    onHoverOut: function(e){
        if (!$(this).hasClass('selected')){
            $(this).find('.btn-controls').hide();
        }
    },
    findModel: function(element_id){
        return allElements.where({
            'id': element_id
        })[0];
    }
});

Mock.block.BlockController = Backbone.View.extend({
    initialize: function(o){
        $.extend(this, o);
        this.createView();
        this.el = this.view.el;
        this.$el = this.view.$el;
        this.view.$el.on({
            'resizestop': this.updatePosition.createDelegate(this)
        });
        //this.view.$el.find('.btn-delete').click(this.onDelete.createDelegate(this));
        //this.model.bind('add', this.onModelAdd);

        if (this.model.isNew()){
            this.updatePosition();
        }
        this.$el.trigger('create');
        this.model.on('remove', this.onRemove.createDelegate(this));
    },

    createView: function(){
        this.view = new Mock.block.BlockView({
            model: this.model
        });
    },

    updatePosition: function(){
        var pos = this.view.$el.position();
        this.model.set({
            'positionx': pos.left,
            'positiony': pos.top,
            'width': this.view.$el.width(),
            'height': this.view.$el.height()
        });
    },

    onRemove: function(){
        //console.log('on remove in controller ');
        this.view.remove();
        this.view.$el.unbind();
        this.$el.unbind();
    }

    /*onDelete: function(){
        var self = this;
        this.$el.trigger('remove');
        this.model.destroy({
            success: this.remove.createDelegate(this)
        });
    },*/

    /*removeView: function(){
        this.view.remove();
        this.view.$el.unbind();
        this.$el.unbind();
    }*/
});


/*var Mock = Mock || {};

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


*/