Mock.namespace('Mock.block');

/* ------------ block collection ------------ */

Mock.block.BlocksCollection = Mock.ModelCollection.extend({
    url: 'blocks',
    history: true
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
            var id = this.model.get('element_id');
            this.el_model = $.grep(Mock.data.elements, function(item){
                    return id == item.id;
                })[0];

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
            html = _.template($("#" + this.tpl_id).html())(this.el_model),
            initial = $.parseJSON(this.el_model.initial),
            params = JSON.parse(this.model.get('params'));
        this.el = $(html)[0];
        this.$el = $(this.el);

        this.$el.attr('id', 'block-' + this.cid);
        this.$el.find('.content').addClass('mock-' + this.el_model.id);
        this.$el.css({
            left: params.x,
            top: params.y,
            width: params.w,
            height: params.h,
            position: 'absolute'
        });

        $('#workspace').append(this.$el);

        if (initial.r.x || initial.r.y){
            var ix = initial.r.x,
                iy = initial.r.y,
                ixy = initial.r.x && initial.r.y;

            $(this.$el)
                .resizable({
                    containment: '#workspace',
                    autoHide: true,
                    handles: ixy ? 'e, s, se' : (ix ? 'e' : 's'),
                    grid: [5, 5]
                });
        }

        /* get values before init funtion for blocks */
        var el_params = $.parseJSON(this.el_model.params),
            params = {};

        if (el_params && el_params.length > 0){
            var custom_params = $.parseJSON(this.model.get('custom_params')),
                opt;
            for (var i = 0; i < el_params.length; i++){
                opt = el_params[i].opt;
                params[opt] = custom_params && custom_params[opt] ? custom_params[opt] : el_params[i].def;
            }
        }

        if (Mock.F[this.el_model.id]){
            var context = this.$el.find('.content');
            Mock.F[this.el_model.id].call(context, params, this.model.get('data'));
        }

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
        this.views.each(function(item, i){
            this.remove();
        });
        this.views.removeAll();
        if (!page) return;

        var self = this,
            url = 'pages/' + page + '/' + this.url;

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
            view = new Mock.block.BlockView({ model: model });

        view.$el.on('resizestop', this.onResizeStopElement.createDelegate(this));
        view.$el.on('save', this.save.createDelegate(this));
        view.$el.children('.content').on('save', this.saveData.createDelegate(this));
        this.views.add(view);
        return view;
    },

    save: function(e, ui, el){
        console.log('save!!!', e, ui, el);
        var view = $.findInArray(this.views.collection, function(item, index){
            return item.el == el;
        });
        view.model.set(ui);
        this.collection.save();
    },
    saveData: function(e, data, el){
        console.log('save data', e, data, el);
        el = $(el).parent('.block');
        if (el.length == 0) return false;

        this.save(e, { data: data }, el[0]);
        return false;
    },

    create: function(e){
        var data = {};

        if (e instanceof jQuery.Event){
            var ws = $('#workspace'),
                left = e.pageX - ws.offset().left - 17,
                top = e.pageY - ws.offset().top - 17,
                id = parseInt(e.target.id.replace('el',''), 10);
            var attrs = $.grep(Mock.data.elements, function(item){
                    return id == item.id;
                })[0],
                params = $.parseJSON(attrs.initial);

            data = {
               element_id: attrs.id,
               z_index: this.last_order,
               params: JSON.stringify({
                   x: left,
                   y: top,
                   w: params.w,
                   h: params.h
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

    findModelByEl: function(els){
        var self = this;
        return els.map(function(index, item){
            var view = self.views.findBy('el', item)[0];
            return view.model;
        });
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
        var size = $('#workspace').offset();
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
        this.collection.save();
    }

});