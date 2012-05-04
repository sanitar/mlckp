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

Mock.Observable = Mock.extend(Backbone.Events, {
    initialize: function(){
        if (this.pluginsConfig !== undefined){
            this.initPlugins();
        }
    },
    initPlugins: function(){
       var self = this,
           root = Mock.plugins,
           plugins = this.pluginsConfig;

       this.plugins = {};

       $.each(plugins, function(key, value){
           if (root[value] !== undefined){
               self.plugins[key] = new root[value]({
                   parent: self
               });
           } else {
               if (console) console.log('Plugin ' + value + ' doesn\'t exist!');
           }
       });
    }
});

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