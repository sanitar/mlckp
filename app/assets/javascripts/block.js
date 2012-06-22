Mock.namespace('Mock.block');

/* ------------ block collection ------------ */

Mock.block.BlocksCollection = Mock.ModelCollection.extend({
    url: 'blocks'
});

/* ---------------- block view -------------- */

Mock.block.BlockView = Backbone.View.extend({
    tpl_id: 'block-template',
    is_group: null,

    initialize: function(options){
        this.is_group = this.model.attributes.is_group;
        if (this.is_group == true){
            this.renderGroup();
        } else {
            this.el_model = this.findModel(this.model.get('element_id'));
            if (!this.el_model){
                console.log('el_model: ', this.model.get('element_id'), '  not found!');
                return;
            }
            this.renderBlock();

            this.$el.on({
                'resizestop': this.updatePosition.createDelegate(this)
            });

            if (this.model.isNew()){
                this.updatePosition();
            }
        }
        this.$el.trigger('create');
        this.model.on('remove', this.onRemove.createDelegate(this));
    },

    renderGroup: function(){
        var model = this.model,
            params = JSON.parse(model.get('params'));

        var group = $('<div />', {
            'class': 'group',
            'css': {
                left: params.x,
                top: params.y,
                width: params.w,
                height: params.h
            },
            'id': 'group-' + this.cid
        }).appendTo('#workspace');

        this.el = group[0];
        this.$el = group;

        return this;
    },

    renderBlock: function(){
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
        });
        /*.editable({
            filter: ".block"
        });*/
        return this;
    },

    disable: function(){
        this.$el.resizable('disable');
        this.$el.draggable('disable');
    },

    enable: function(){
        this.$el.resizable('enable');
        this.$el.draggable('enable');
    },

    findModel: function(element_id){
        return allElements.where({
            'id': element_id
        })[0];
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
        this.remove();
    }
});

/* ---------------------------------------------------- */
/* ---------------- new block controller -------------- */
/* ---------------------------------------------------- */

Mock.block.BlocksController = Mock.extend(null, {
    url: 'blocks',
    collection: Mock.block.BlocksCollection,
    last_order: 0,

    initialize: function(o){
        $.extend(this, o);

        this.views = new Mock.Collection();
        this.collection = new this.collection();
        this.collection.on('reset', this.render.createDelegate(this));
        $(this).on('fetched', this.render.createDelegate(this));

        $('#groups .tab-pane > div').on('dragstop', this.onDragStopElement.createDelegate(this));
    },

    fetch: function(page){
        var self = this,
            url = 'pages/' + page + '/' + this.url;

        this.views.removeAll();

        this.collection.fetch({
            silent: true,
            url: url,
            success: function(collection, data){
                self.collection.url = url;
                $(self).trigger('fetched', [data, page]);
            }
        });
    },

    render: function(data){
        var self = this;

        var renderGroup = function(model){
            var group_view = self.createBlockView(model),
                inner = self.collection.where({ parent_id: model.attributes.id }),
                view;

            for (var i = 0; i < inner.length; i++){
                if (inner[i].attributes['is_group']){
                    view = renderGroup(inner[i]);
                } else {
                    view = self.createBlockView(inner[i]);
                }
                view.$el.detach().appendTo(group_view.$el).addClass('group-block');
                view.disable();
            }
            return group_view;
        }

        var renderModels = function(model){
            var data = model.attributes;
            if (data.parent_id) return;
            if (data.is_group){
                renderGroup(model);
            } else {
                self.createBlockView(model);
            }
        }
        if (data instanceof jQuery.Event){
            this.collection.each(function(model){
                renderModels(model);
                self.last_order = Math.max(self.last_order, model.attributes['z_index']);
            });
        } else {
            $(data).each(function(index, model){
                renderModels(model);
                self.last_order = Math.max(self.last_order, model.attributes['z_index']);
            });
        }
        self.last_order++;
    },

    createBlockView: function(model){
        var self = this,
            view = new Mock.block.BlockView({
            model: model
        });

        view.$el.on('resizestop', this.onResizeStopElement.createDelegate(this));
        this.views.add(view);
        return view;
    },

    create: function(e){
        var data = {};

        if (e instanceof jQuery.Event){
            var ws = Mock.C.ws,
                left = e.pageX - ws.offset().left - 17,
                top = e.pageY - ws.offset().top - 17,
                attrs = allElements.get(parseInt(e.target.id.replace('el',''))).attributes;

            data = {
                element_id: attrs.id,
                z_index: this.last_order,
                params: JSON.stringify({
                    x: left,
                    y: top
                })
            }
        } else {
            data = e;
            e['z_index'] = this.last_order;
        }
        this.last_order++;

        var item = this.collection.add([data]).last();
        return this.createBlockView(item);
    },

    update: function(els){
        var self = this;
        els.each(function(){
            var view = self.views.findBy('el', this)[0];
            view.updatePosition();
        });
        this.collection.save();
    },

    copy: function(model){
        var data = {};
        for (var attr in model.attributes){
            if (model.attributes[attr] !== null && attr !== 'id' && attr !== 'parent_id'){
                data[attr] = model.attributes[attr];
            }
        }
        if (!model.attributes.parent_id){
            data['z_index'] = this.last_order;
            this.last_order++;
        }
        return this.collection.add(data).last();
    },

    onResizeStopElement: function(e, ui, el){
        this.update($(el));
    },

    onDragStopElement: function(e){
        var size = Mock.C.ws.offset();
        if ((e.pageX-10) > size.left && (e.pageY-10) > size.top){
            this.create(e);
        }
        this.collection.save();
    },

    updateOrder: function(){
        var self = this,
            ws = $('#workspace'),
            els = ws.children('.block, .group');

        els.each(function(index){
            var view = self.views.findBy('el', this)[0];
            if (view.model.attributes['z_index'] !== (index + 1)){
                view.model.set({
                    z_index: index + 1
                });
                last_order = index + 1;
            }
        });
        console.log(this.collection.changesConfig);
        this.collection.save();
    }

});