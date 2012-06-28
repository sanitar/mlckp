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
        return false;
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