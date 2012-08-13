Mock.Collection = Mock.extend(null, {
    initialize: function(o){
        this.collection = [];
        if ($.isArray(o)){
            this.collection = o;
        }
    },

    add: function(c, silent){
        if ($.isArray(c)){
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
        if ($.isArray(c)){
            if (!c.length) return;
            var arr = [];
            while(c.length > 0){
                arr.push(c[0]);
                if (this.remove(c[0], true) === false){
                    c.splice(0, 1);
                    arr.pop();
                }
            }
            c = arr;
        } else {
            var index = this.collection.indexOf(c);
            if (index != -1){
                this.collection.splice(index, 1);
            } else {
                return false;
            }
        }
        if (silent !== true){
            $(this).trigger('removeitem', [c, this.collection]);
        }
    },

    removeAll: function(){
        this.remove(this.collection);
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
    history: false,
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
            if (this.history){
                Mock.history.set(ch[type]);
            }

            $.ajax({
                url: this.url + '/' + type,
                type: 'post',
                data: {
                    data: ch[type]
                },
                dataType: 'json',
                traditional: false,
                success: function(responce, result, info){
                    if (type == 'create'){
                        var models = [];
                        $.each(responce, function(key, value){
                           model = self.getByCid(key);
                           models.push(model);
                           model.set(value);
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