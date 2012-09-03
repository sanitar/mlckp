Mock.BlockGroupComposite = Mock.extend(null, {
    selected: null,
    current_page: null,
    historyStorage: {},
    initialize: function(o){
        $.extend(this, o);
        this.blocks = new Mock.block.BlocksController();
        this.propsPanel = new Mock.properties.Controller();
    },

    fetch: function(page){
        var isPage = $.isNumeric(page);
        if (this.current_page) this.historyStorage[this.current_page] = Mock.history;
        this.blocks.fetch(page);
        if (this.historyStorage[page]) {

        }
    },

    update: function(els){
        this.blocks.update(els);
    },

    reloadPropsPanel: function(e, s, ws){
       var sel = $(ws).find('.ui-selected');
        if (!this.isSimilar(this.selected, sel)){
            var models = this.blocks.findModelByEl(sel);
            this.propsPanel.render(models, sel);
            this.selected = sel;
        }
    },
    isSimilar: function(arr1, arr2){
        if (!arr1 || !arr2) return false;
        var len1 = arr1.length,
            len2 = arr2.length;
        if (len1 !== len2) return false;
        for (var i = 0; i < len1; i++){
            if (arr1[i] != arr2[i]) return false;
        }
        return true;
    },

    remove: function(els){
        if (els.size() == 0) return;

        var self = this,
            views = this.blocks.views,
            collection = this.blocks.collection;

        var removeGroup = function(model){
            var inner = collection.where({ parent_id: model.attributes.id });
            for (var i = 0; i < inner.length; i++){
                if (inner[i].attributes['is_group'] == true){
                    removeGroup(inner[i]);
                } else {
                    collection.remove(inner[i]);
                }
            }
            collection.remove(model);
        }
        els.each(function(){
            var el = $(this),
                view = views.findBy('el', this)[0];

            if (el.hasClass('group')){
                removeGroup(view.model);
            } else {
                collection.remove(view.model);
            }
        });
        this.blocks.collection.save();
        this.blocks.updateOrder();
    },

    save: function(els){
        var self = this,
            views = this.blocks.views;
        if (els !== undefined){
            els.each(function(){
                views.findBy('el', this)[0].updatePosition();
            });
        } else {
            views.each(function(){
                this.updatePosition();
            });
        }

        this.blocks.collection.save();
    },

    /* ------------- common functions -------------- */

    duplicate: function(els, opts){
        console.log('duplicate,', opts);
        if (els.size() == 0) return;

        var self = this,
            views = this.blocks.views,
            collection = this.blocks.collection,
            xz = {};

        var duplicateGroup = function(model){
            var groupModel = self.blocks.copy(model),
                cid = groupModel.cid,
                inner = collection.where({ parent_id: model.attributes.id }),
                created_model;

            xz[cid] = [];

            for (var i = 0; i < inner.length; i++){
                if (inner[i].attributes['is_group']){
                    created_model = duplicateGroup(inner[i]);
                } else {
                    created_model = self.blocks.copy(inner[i]);
                }
                xz[cid].push(created_model.cid);
            }
            return groupModel;
        }
        // вычисляем насколько надо переместить каждый элемент (delta)
        if (opts){
            var pos = els.positionRectangle(),
                delta = { left: opts.left - pos.left, top: opts.top - pos.top };
        }
        els.each(function(){
            var el = $(this),
                view = views.findBy('el', this)[0],
                created_model;
            if (el.hasClass('group')){
                created_model = duplicateGroup(view.model);
            } else {
                created_model = self.blocks.copy(view.model);
            }
            var params = $.parseJSON(created_model.attributes.params);
            params.x += delta ? delta.left : 10;
            params.y += delta ? delta.top : 10;
            created_model.set({
                params: JSON.stringify(params)
            });
            self.blocks.createBlockView(created_model);
        });
        collection.save({
            success: function(models, responce){
                var model;

                for (var i = 0; i < models.length; i++){
                    model = models[i];
                    var id = model.attributes.id,
                        cid = model.cid;
                    if (xz[cid] == undefined) continue;
                    for (var j = 0; j < xz[cid].length; j++){
                        var child_model = collection.getByCid(xz[cid][j]);
                        child_model.set({
                            parent_id: id
                        });
                    }
                }
                collection.save({
                    success: function(){
                        self.blocks.render(models);
                        for (var i = 0; i < models.length; i++){
                            if (models[i].attributes.parent_id) continue;
                            var view = self.blocks.views.findBy('model', models[i])[0];
                            view.$el.addClass('ui-selected');
                        }
                    }
                });

            }
        });

        els.removeClass('ui-selected');
    },

    group: function(els){
        els = els.filter('.block, .group');
        if (els.size() < 2) return;

        var self = this,
            minx, miny, maxx, maxy;

        els.each(function(){
            var el = $(this),
                pos = el.position(),
                mx = el.width() + pos.left,
                my = el.height() + pos.top;

            minx = (!minx || minx > pos.left) ? pos.left : minx;
            miny = (!miny || miny > pos.top) ? pos.top : miny;
            maxx = (!maxx || maxx < mx) ? mx : maxx;
            maxy = (!maxy || maxy < my) ? my : maxy;
        });

        var views = this.blocks.views;

        this.blocks.collection.add([{
            z_index: 0,
            params: JSON.stringify({
                x: minx,
                y: miny,
                w: maxx - minx,
                h: maxy - miny
            }),
            is_group: true
        }]);

        this.blocks.collection.save({
            success: function(model, responce){
                model = model[0];
                for (var idata in responce){
                    var data = responce[idata];
                    var group = self.blocks.createBlockView(model);

                    els.each(function(){
                        var el = $(this),
                            pos = el.position(),
                            view;

                        view = views.findBy('el', this)[0];
                        el.css({
                           left: pos.left - minx,
                           top: pos.top - miny
                        });
                        view.updatePosition();

                        view.model.set({
                            parent_id: data.id
                        });
                        view.disable();
                        el.detach().appendTo(group.$el);
                        el.addClass('group-block');
                    });
                    self.blocks.collection.save();
                    els.removeClass('ui-selected');
                    group.$el.addClass('ui-selected');
                }
            }
        });
    },

    ungroup: function(els){
        els = els.filter('.group');
        if (els.size() < 1) return;

        var self = this,
            views = this.blocks.views,
            ws = $('#workspace');

        els.each(function(){
            var groupEl = $(this),
                groupView = views.findBy('el', this)[0],
                groupParams = $.parseJSON(groupView.model.attributes.params),
                inner = groupEl.children();

            inner.each(function(){
                var el = $(this),
                    view = views.findBy('el', this)[0],
                    params = $.parseJSON(view.model.attributes.params);
                el.css({
                    left: params.x + groupParams.x,
                    top: params.y + groupParams.y
                });
                el.detach().appendTo(ws).removeClass('group-block').addClass('ui-selected');
                view.updatePosition();
                view.model.set('parent_id', null);
                view.enable();
            });
            self.blocks.collection.remove(groupView.model);
        });
        this.blocks.collection.save();
        this.blocks.collection.save();
    },

    normalizeAttributes: function(model, attrs, justReplace){
        var denied = ['updated_at', 'created_at', 'id'],
            model_attrs = model.attributes;
        for (var model_attr in model_attrs){
            if ($.inArray(model_attr, denied) == -1 && attrs[model_attr] !== undefined && attrs[model_attr] != model_attrs[model_attr]){
                model.set(model_attr, attrs[model_attr]);
            }
            if (justReplace !== true && ($.inArray(model_attr, denied) !== -1 || model_attrs[model_attr] === null)){
                model.unset(model_attr);
            }
        }
        return model;
    },

    historyUndo: function(){
        var obj = Mock.history.undo();
        if (!obj) return;
        for (var i = 0; i < obj.data.length; i++){
            var block = obj.data[i];
            if (obj.type == 'delete'){
                var model = this.blocks.collection.add(this.normalizeAttributes(block.model, block.attrs)).last();
                this.blocks.createBlockView(model);
            }
            if (obj.type == 'create'){
                this.blocks.collection.remove(block.model);
            }
            if (obj.type == 'update'){
                this.normalizeAttributes(block.model, block.prevAttrs, true);
            }
        }
        this.blocks.collection.save({ addToHistory: false });
    },

    historyRedo: function(){
        var obj = Mock.history.redo();
        if (!obj) return;
        for (var i = 0; i < obj.data.length; i++){
            var block = obj.data[i];
            if (obj.type == 'delete'){
                this.blocks.collection.remove(block.model);
            }
            if (obj.type == 'create'){
                var model = this.blocks.collection.add(this.normalizeAttributes(block.model, block.attrs)).last();
                this.blocks.createBlockView(model);
            }
            if (obj.type == 'update'){
                this.normalizeAttributes(block.model, block.attrs, true);
            }
        }
        this.blocks.collection.save({ addToHistory: false });
    },

    updateZIndex: function(){
        this.blocks.updateOrder();
    }
});
