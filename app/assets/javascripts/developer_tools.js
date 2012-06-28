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
            console.log(Mock.data);

            this.initComponents();
            this.initEvents();

            $('#workspace').splitter({
                type: 'v'
            });

            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });
        },

        initComponents: function(){
            this.controller = new Mock.element.Controller();
            /*this.elements = new Mock.element.Controller({
                collection: elementCollection
            });
            this.html = CodeMirror.fromTextArea($('#html')[0], {
                mode: "htmlmixed",
                tabMode: "indent",
                lineNumbers: true,
                readOnly: true,
                value: '<code>some code</code>',
                onBlur: this.elements.updateCode.createDelegate(this.elements)
            });

            this.css = CodeMirror.fromTextArea($('#css')[0], {
                mode: "css",
                readOnly: true,
                tabMode: "indent",
                lineNumbers: true,
                value: '<code>some code</code>',
                onBlur: this.elements.updateCode.createDelegate(this.elements)
            });

            this.js = CodeMirror.fromTextArea($('#js')[0], {
                mode: "javascript",
                tabMode: "indent",
                lineNumbers: true,
                readOnly: true,
                value: '<code>some code</code>',
                onBlur: this.elements.updateCode.createDelegate(this.elements)
            });*/

        },

        initEvents: function(){
            /*this.elements.on('route:load', this.loadElement.createDelegate(this, undefined));
            Backbone.history.start();*/
        }

        /*makeCodeEditorAction: function(action){
            var args = Array.prototype.slice.call(arguments, 1);
            this.html[action].apply(this, args);
            this.css[action].apply(this, args);
            this.js[action].apply(this, args);
        },

        loadElement: function(id){
            console.log('load el data', id, $.isNumeric(id));
            var hasRouteId = $.isNumeric(id);

            this.makeCodeEditorAction('setOption', 'readOnly', !hasRouteId);
            this.makeCodeEditorAction('clearHistory');

            if (hasRouteId){
                ws.removeClass('disabled');
                var model = elementCollection.get(id);
                this.html.setValue(model.attributes.html || '');
                this.css.setValue(model.attributes.css || '');
                this.js.setValue(model.attributes.js || '');
            } else {
                ws.addClass('disabled');
                this.makeCodeEditorAction('setValue', '');
            }
        }*/
    });

    var directory = new DirectoryView();
});

