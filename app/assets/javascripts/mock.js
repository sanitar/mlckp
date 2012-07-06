var Mock = Mock || {};

// создаёт объекты в указанной цепочке, если их не существует
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

// для наследования
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

// позволяет устанавливать scope для функции при её определении
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

// буфер ввода
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