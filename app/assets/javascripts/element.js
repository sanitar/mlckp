Mock.namespace('Mock.element');

// коллекция элементов
Mock.element.Collection = Mock.ModelCollection.extend({
    url: 'elements'
});

/* ---------------------------------------------- */
/* ---------------- code Editors ------------------ */

Mock.element.CodeEditor = Mock.extend(null, {
    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
        this.values = {
            html: '',
            css: '',
            js: ''
        }
    },

    initComponents: function(){
        var conf = {
             tabMode: "indent",
             lineNumbers: true,
             value: '',
             onBlur: this.updateCode.createDelegate(this)
         }
         this.html = CodeMirror.fromTextArea($('#html')[0], $.extend({ mode: "htmlmixed" }, conf));
         this.css = CodeMirror.fromTextArea($('#css')[0], $.extend({ mode: "css" }, conf));
         this.js = CodeMirror.fromTextArea($('#js')[0], $.extend({ mode: "javascript" }, conf));
    },

    initEvents: function(){
    },

    toggle: function(enable){
        this.makeAction('setOption', 'readOnly', !enable);
        $('#workspace').toggleClass('disabled', !enable);
    },

    //private
    makeAction: function(action){
        var args = Array.prototype.slice.call(arguments, 1);
        this.html[action].apply(this, args);
        this.css[action].apply(this, args);
        this.js[action].apply(this, args);
    },

    updateCode: function(funcs, conf){
        var self = this,
            changeset = {},
            modeConf = {
                htmlmixed: 'html',
                css: 'css',
                javascript: 'js'
            };

        var func = function(mode){
            var val = self[mode].getValue();
            if (val !== self.values[mode]){
                changeset[mode] = val;
                self.values[mode] = val;
            }
        }

        func(modeConf[conf.mode]);
        if (!$.isEmptyObject(changeset)){
            $(this).trigger('update', changeset);
        }
    },

    load: function(model){
        var attrs = model ? model.attributes : {};
        this.html.setValue(attrs.html || '');
        this.css.setValue(attrs.css || '');
        this.js.setValue(attrs.js || '');
        this.values = {
            html: attrs.html || '',
            css: attrs.css || '',
            js: attrs.js || ''
        }
    }
});

/* ---------------------------------------------- */
/* ---------------- controller ------------------ */

Mock.element.Controller = Backbone.Router.extend({
    current_model: null,
    routes: {
        ':element': 'load',
        '': 'load'
    },

    initialize: function(o){
        $.extend(this, o);
        this.initComponents();
        this.initEvents();
    },

    initComponents: function(){
        this.collection = new Mock.element.Collection(Mock.data.elements);
        this.navigation = new Mock.element.nav.Controller({ collection: this.collection });
        this.codeEditors = new Mock.element.CodeEditor();
        this.params = new Mock.element.params.Controller();
    },

    initEvents: function(){
        $(this.navigation).on('remove', this.onRemoveModel.createDelegate(this));
        $(this.codeEditors).on('update', this.onUpdateCode.createDelegate(this));
        $(this.params).on('update', this.onUpdateCode.createDelegate(this));
    },

    load: function(element_id){
        var curr_model = this.current_model;
        if ((curr_model && (curr_model.attributes.id != element_id)) || !curr_model){
            var model = this.current_model = this.collection.get(element_id);
            this.navigation.select(element_id);

            this.codeEditors.toggle(element_id ? true : false);
            this.codeEditors.load(model);

            this.params.toggle(element_id ? true : false);
            this.params.load(model);
        }
    },

    onRemoveModel: function(e, model){
        if (this.current_model == model){
            this.navigate('#', {trigger: true});
        }
    },

    onUpdateCode: function(e, changeset){
        for (var i in changeset){
            this.current_model.set(i, changeset[i]);
        }
        this.collection.save();
    }
});
