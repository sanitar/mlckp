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
            this.initSlitters();
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
        },
        initSlitters: function(){
            $('#workspace').splitter({
                type: 'v'
            });
            /*$('#htmlcode > .CodeMirror, #csscode > .CodeMirror').resizable({
                handles: 's'
            });*/
            /*$('.leftside').splitter({
                type: 'h'
            });
            $('.rightside').splitter({
                type: 'h'
            });*/

            /*$('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });

            $('#navigation > div').splitter({
                type: 'h',
                sizeTop: true,
                accessKey:"P"
            });*/
        }
    });

    var directory = new DirectoryView();
});

