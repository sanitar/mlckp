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
        this.bind('change', this.onChange);
        this.bind('remove', this.onRemove);
        this.bind('add', this.onAdd);
    },

    onAdd: function(model, ui){
        this.changes.create[model.cid] = model.attributes;
    },

    onRemove: function(model, col, obj){
        if (!model.isNew()){
            this.changes['delete'].push(model.id);
        }
    },

    onChange: function(model, ui){
        if (ui.changes['id'] === true) return;
        var isNew = model.isNew(),
            id = isNew ? model.cid : model.id,
            arr = this.changes[isNew ? 'create' : 'update'];
        arr[id] = arr[id] || {};
        $.extend(arr[id], model.changedAttributes());
    },

    save: function(){
        console.log('we want save data: ', this.changes);

        var self = this,
            model,
            ch = this.changes,
            type = ch['delete'].length ? 'delete'
                : ($.isEmptyObject(ch['update']) ? 'create' : 'update');

        $.ajax({
            url: this.url + '/' + type,
            type: 'post',
            data: {
                'data': ch[type]
            },
            dataType: 'json',
            traditional: false,
            success: function(responce, result, info){
                if (type == 'create'){
                    $.each(responce, function(key, value){
                       model = self.getByCid(key);
                        if (model){
                            model.set(value);
                        }
                    });
                }
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
            html = _.template($("#" + this.tpl_id).html())(this.el_model.toJSON()),
            params = JSON.parse(this.model.get('params'));
        this.el = $(html)[0];
        this.$el = $(this.el);

        this.$el.attr('id', 'block-' + this.cid);
        this.$el.addClass(this.el_model.attributes.css);
        this.$el.css({
           left: params.x,
           top: params.y,
           position: 'absolute'
        });
        if (params.w !== undefined){
            this.$el.width(params.w);
        }
        if (params.h !== undefined){
            this.$el.height(params.h);
        }

        $('#workspace').append(this.$el);

        $(this.$el)
        .resizable({
            containment: '#workspace',
            autoHide: true,
            grid: [5, 5]
        })
        .editable({
            filter: ".block"
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
        var el = this.$el;
            pos = el.position();

        var data = {
            x: pos.left,
            y: pos.top,
            w: el.width(),
            h: el.height()
        };

        this.model.set({
            params: JSON.stringify(data)
        });
    },

    onRemove: function(){
        this.view.remove();
        this.view.$el.unbind();
        this.$el.unbind();
    }
});

