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
            this.collection = [];
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
