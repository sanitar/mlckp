var Mock = Mock || {};

Mock.namespace = function(ns_string){
    var parts = ns_string.split('.'),
        parent = Mock,
        i = 0;
    if (parts[0] === 'Mock'){
        parts = parts.slice(1);
    }
    for (; i < parts.length; i++){
        if (typeof parent[parts[i]] === 'undefined'){
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }
    return parent;
};

Mock.extend = function(Parent, props){
    var Child, F, i;

    Child = function(){
        if (Child.uber && Child.uber.hasOwnProperty("initialize")){
            Child.uber.initialize.apply(this, arguments);
        }
        if (Child.prototype.hasOwnProperty("initialize")){
            Child.prototype.initialize.apply(this, arguments);
        }
    }

    Parent = Parent || Object;
    F = function(){};
    F.prototype = Parent.prototype;
    Child.prototype = new F();
    Child.uber = Parent.prototype;
    Child.prototype.constructor = Child;

    for (i in props){
        if (props.hasOwnProperty(i)){
            Child.prototype[i] = props[i];
        }
    }
    return Child;
};

Mock.isArray = function(obj){
    return Object.prototype.toString.call(obj, []) === '[object Array]';
};

$.extend(Function.prototype, {
    createDelegate: function(obj, args, appendArgs){
        var method = this;
        return function() {
            var callArgs = args || arguments;
            callArgs = Array.prototype.slice.call(arguments, 0); // copy arguments first
            callArgs = callArgs.concat(this);
            if (appendArgs === true){
                callArgs = callArgs.concat(args);
            }else if (typeof appendArgs === 'number'){
                var applyArgs = [appendArgs, 0].concat(args); // create method call params
                Array.prototype.splice.apply(callArgs, applyArgs); // splice them in
            }
            return method.apply(obj || window, callArgs);
        }
    }
});

$.extend(Array.prototype, {
   remove : function(o){
        var index = this.indexOf(o);
        if(index != -1){
            this.splice(index, 1);
        }
        return this;
    },

    qsort: function(compare, change){
        var a = this,
            f_compare = compare,
            f_change  = change;

        if (f_compare == undefined) { // Будем использовать простую функцию (для чисел)
            f_compare = function(a, b) {return ((a == b) ? 0 : ((a > b) ? 1 : -1));};
        };
        if (f_change == undefined) { // Будем использовать простую смены (для чисел)
            f_change = function(a, i, j) {var c = a[i];a[i] = a[j];a[j] = c;};
        };

        var qs = function (l, r)  {
            var i = l,
                j = r,
                x = a[Math.floor(Math.random()*(r-l+1))+l];
                // x = a[l]; // Если нет желания использовать объект Math

            while(i <= j) {
                while(f_compare(a[i], x) == -1) {i++;}
                while(f_compare(a[j], x) == 1) {j--;}
                if(i <= j) {f_change(a, i++, j--);}
            };
            if(l < j) {qs(l, j);}
            if(i < r) {qs(i, r);}
        };

        qs(0, a.length-1);
    }
});

$(document).ready(function(){
    Mock.constants = Mock.C = {
        workspace_id: '#workspace',
        ws: $('#workspace')
    }
});

Mock.namespace('Mock.dialog');

Mock.dialog.AddEditDialog = Backbone.View.extend({
    isEdit: false,
    editHeader: 'Edit',
    addHeader: 'Add',
    elId: '#add-edit-dialog',
    events: {
        'click .btn-primary': 'onSaveClick'
    },

    initialize: function(cfg){
        $.extend(this, cfg);
        this.$el = $(this.elId).modal({ show: false });
        this.el = this.$el.get()[0];
    },

    show: function(text){
        this.isEdit = text ? true : false;
        this.$el.find('input').attr('value', text || "");
        this.$el.find('.modal-header > h4').text(text ? this.editHeader : this.addHeader);
        this.$el.modal('show');
    },

    hide: function(){
        this.$el.modal('hide');
    },

    onSaveClick: function(){
        this.hide();
        var text = this.$el.find('input').attr('value');
        $(this).trigger('save', [this.isEdit, text]);
    }
});

Mock.buffer = (function(){
    var buffer;
    return {
        set: function(val){
            buffer = val;
        },
        get: function(){
            return buffer;
        }
    }
}());