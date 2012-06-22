Mock.namespace('Mock.Collection');

Mock.Collection = Mock.extend(null, {
    initialize: function(o){
        this.collection = [];
        if (Mock.isArray(o)){
            this.collection = o;
        }
    },

    add: function(c, silent){
        if (Mock.isArray(c)){
            for (var i = 0, len = c.length; i < len; i++){
                if (!this.inArray(c[i])){
                    this.collection.push(c[i]);
                }
            }
        } else {
            if (!this.inArray(c)){
                this.collection.push(c);
            }
        }
        if (silent !== true){
            $(this).trigger('additem', [c, this.collection]);
        }
    },

    remove: function(c, silent){
        if (Mock.isArray(c)){
            var self = this;
            for (var i = 0, len = c.length; i < len; i++){
                this.collection.remove(c[i]);
            }
        } else {
            this.collection.remove(c);
        }
        if (silent !== true){
            $(this).trigger('removeitem', [c, this.collection]);
        }
    },

    // если есть элемент - удалить, если нет элемента - добавить
    toggle: function(c){
        if (this.inArray(c)){
            this.remove(c);
        } else {
            this.add(c);
        }
    },

    removeAll: function(){
        if (!this.isEmpty()){
            var c = this.collection;
            this.each(function(index, item){
                item.remove();
            });
            $(this).trigger('removeitem', [c, this.collection]);
        }
    },

    isEmpty: function(){
        return this.collection.length == 0;
    },

    inArray: function(c){
        return ($.inArray(c, this.collection) !== -1);
    },

    findBy: function(prop, value){
        var grep = $.grep(this.collection, function(item, index){
            return item[prop] === value;
        });
        return grep.length == 0 ? false : grep;
    },

    each: function(callback, args){
        return jQuery.each( this.collection, callback, args );
    }
});

Mock.ModelCollection = Backbone.Collection.extend({
    model: Backbone.Model,
    changesConfig: {
        'delete': [],
        'update': {},
        'create': {}
    },

    initialize: function(){
        this.changes = $.extend({}, this.changesConfig);
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

    save: function(opts){
        var self = this,
            model, type,
            ch = this.changes;

        for (var i in ch){
            var arr = $.isArray(ch[i]);
            if ((arr && ch[i].length) || (!arr && !$.isEmptyObject(ch[i]))){
                type = i;
            }
        }

        if (type !== undefined){
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
                        var models = [];
                        $.each(responce, function(key, value){
                           model = self.getByCid(key);
                           models.push(model);
                            if (model){
                                model.set({
                                    id: value.id
                                });
                            }
                        });
                        if (opts && opts.success){
                            opts.success(models, responce);
                        }
                    } else {
                        if (opts && opts.success){
                            opts.success(responce);
                        }
                    }
                }
            });
        } else {
            if (console) console.log('oops! No any data to save, but have to!');
        }
        this.changes[type] = $.isArray(ch[type]) ? [] : {};
    }
});