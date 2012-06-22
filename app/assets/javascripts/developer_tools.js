$(document).ready(function(){
    var dir = this,
        ws = $('#workspace');

    _.templateSettings = {
        interpolate : /\{\{(.+?)\}\}/g,
        evaluate: /\{\{(.+?)\}\}/g
    };

    var DirectoryView = Mock.extend(null, {
        initialize: function(){
            dir = this;
            $('#elements .well li').hover(function(e, el){
                $(this).find('span').toggle();
            });

            $('#workspace').splitter({
                type: 'v'
            });

            this.html = CodeMirror.fromTextArea($('#html')[0], {
                mode: "text/html",
                tabMode: "indent",
                lineNumbers: true,
                value: '<code>some code</code>'
            });

            this.css = CodeMirror.fromTextArea($('#css')[0], {
                mode: "text/css",
                tabMode: "indent",
                lineNumbers: true,
                value: '<code>some code</code>'
            });

            this.js = CodeMirror.fromTextArea($('#js')[0], {
                mode: "text/javascript",
                tabMode: "indent",
                lineNumbers: true,
                value: '<code>some code</code>'
            });

            this.elements = new Mock.element.Controller({
                collection: elementCollection,
                prefix: 'element',
                nameAttr: 'label'
            });
            Backbone.history.start();
            this.elements.on('route:load', this.loadElement.createDelegate(this));
            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });
            $('#params').tableList({
                tables: [{
                    name: 'Initial',
                    prefix: 'initial', // prefix for events from this grid
                    mode: 'e',
                    table: {
                        'width': 'label',
                        'height': 'label'
                    }
                },{
                    name: 'Parameters',
                    prefix: 'params',
                    mode: 'aed',
                    table: {
                    }
                }]
            });
        },

        loadElement: function(id){
            console.log('load el data', id);
        }
    });

    var directory = new DirectoryView();
});

