var Mock = Mock || {};

Mock.Controller = Backbone.View.extend({
    plugins: {},
    pluginsRoot: 'Mock.plugins',
    initialize: function(){
        this.initPlugins();
    },
    initPlugins: function(){
        var pl,
            C,
            pls = this.plugins;

        for (pl in pls){
            console.log(this.pluginsRoot)
            C = window['Mock'];
            console.log(C);
            /*if (C && typeof(C) === 'function'){
                this[pl] = new C();
                console.log('plugin activated: ', this[pl]);
            } else {
                console.log('plugin missed: ', this.pluginsRoot + '.' + pls[pl]);
            }*/
        }
    },
    disablePlugin: function(){
    },
    enablePlugin: function(){}
});