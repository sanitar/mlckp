var Mock = Mock || {};
Mock.plugins = Mock.plugins || {};

// constructor
Mock.Plugin = {};
$.extend(true, Mock.Plugin.prototype, Backbone.Events, {
    enable:  function(){    },
    disable: function(){    }
});

// classes
Mock.plugins.MultiSelect = function(parent){
    this.parent = parent;
    this.initialize(arguments);
}
$.extend(true, Mock.plugins.MultiSelect.prototype, Mock.Plugin, {
    initialize: function(parent){

    }
});